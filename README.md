# Fast & efficient integration testing in NestJS

Integration tests should exercise the real HTTP layer, the real DI graph, real SQL, and real event writes. They usually don't, because booting an app per test and cleaning the database between tests is slow.

This reference shows a different approach: **one app per test file, in-process HTTP, a real Postgres, and a transaction that rolls back after every mutating test**. No mocks, no truncation, no per-test boots.

## The speed model at a glance

| Cost | Typical setup | This repo |
| --- | --- | --- |
| App boot | once per test | once per file |
| HTTP transport | TCP via supertest | `app.inject()` in-process |
| DB cleanup | truncate + reseed | transaction rollback |
| Parallelism | serial | `describe.concurrent` |
| Postgres durability | full | `fsync=off`, tmpfs, minimal WAL |
| Time | real clock | frozen `Date` |

## Boot once per file

`createTestSuite` lazily boots the app the first time `context()` is called and reuses it for the whole file. Each Vitest worker gets its own app and connection pool.

```ts
const testApp = createTestSuite({
  freezeDate: '2000-01-02T00:00:00.000Z',
  poolSize: 10,
});

let app, txHost, now;

beforeAll(async () => {
  ({ app, txHost, now } = await testApp.context());
});

afterAll(async () => {
  await testApp.teardown();
});
```

See `test/shared/testing/test-suite.ts`.

## In-process HTTP

Requests go through Fastify's `app.inject()`, so there is no socket and no network overhead, but the request still travels through the full NestJS pipeline: routing, pipes, validation, controller, service, repository.

A per-controller client hides the transport details and parses success bodies into DTOs:

```ts
const { body } = await productsClient(app)
  .findById(id)
  .expectStatus(HttpStatus.OK);

expect(body).toStrictEqual(expectedResponse);
```

See `test/shared/clients/products.client.ts`.

## Rollback instead of cleanup

This is the core trick. Every mutating test runs inside a database transaction that is never committed:

```ts
export async function isolateInTransaction(callback, txHost) {
  const ROLLBACK = Symbol('ROLLBACK');

  try {
    await txHost.withTransaction(async () => {
      await callback();
      throw ROLLBACK;
    });
  } catch (error) {
    if (error !== ROLLBACK) throw error;
  }
}
```

Repositories read and write through `txHost.tx`, and the service methods use `@Transactional(Propagation.Nested)`. Nested transactions join the outer test transaction, so every insert and update is rolled back when the callback finishes.

No `TRUNCATE`, no re-seeding, no ordering dependencies.

See `test/shared/utils/isolateInTransaction.ts`.

## Deterministic fixtures

Fixtures are committed seed rows, not per-test inserts. Their ids are derived from the fixture name, so the seed runner and the tests agree without a registry:

```ts
const { id } = ProductEntityBuilder[ProductFixtureNames.DEFAULT_PRODUCT].result;
```

Builders provide `defaultAll()`, `.with({...})`, and `.omit(...)`, and the same builders produce both request bodies and expected values. That makes `toStrictEqual` the natural assertion style.

- Seed runner: `seeds/seed-runner.ts` (upserts rows back to fixture defaults).
- Entity and DTO builders: `test/shared/fixtures/builders/`.
- `make seeds-up` refreshes the committed fixtures.

## Frozen time

`freezeDate` fakes only `Date`, and tests derive expected timestamps from `now`:

```ts
const expected = ProductDtoBuilder.defaultAll().with({
  updatedAt: now.toISOString(),
}).result;
```

When a test updates a seeded row, freeze at an instant **distinct** from the fixture's timestamp, otherwise TypeORM may regenerate the update date as real time.

## Concurrency and pool sizing

Mark suites and tests with `.concurrent`:

```ts
describe.concurrent(ProductController.name, () => {
  it.concurrent('returns the seeded product', async () => { /* ... */ });
});
```

Each concurrent test gets its own CLS transaction and pooled connection. The default `DB_POOL_SIZE` is intentionally small; a file that needs more headroom passes `poolSize` to `createTestSuite`, which overrides it before the app boots.

## Putting it together

A condensed mutating test:

```ts
it.concurrent('creates a product and records an event', async () => {
  await isolateInTransaction(async () => {
    // 1. Build the request from the same defaults as the expected output.
    const requestBody = ProductDtoBuilder.defaultAll().result;

    // 2. Call the real endpoint in-process.
    const { body } = await productsClient(app)
      .create(requestBody)
      .expectStatus(HttpStatus.CREATED);

    // 3. Build expectations, including the generated id.
    const id = body.id;
    const expectedEntity = ProductEntityBuilder.defaultAll().with({ id }).result;
    const expectedEvent = ProductEventEntityBuilder.defaultAll().with({
      eventName: ProductEventNameEnum.PRODUCT_WAS_CREATED,
      aggregateId: id,
      createdAt: now,
      value: body,
    }).result;

    // 4. Assert the response, the row, and the event.
    expect(body).toStrictEqual(
      ProductDtoBuilder.defaultAll().with({ id }).result,
    );
    await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
    await expectProductEventInDB({ txHost, aggregateId: id })
      .toStrictEqual(expectedEvent);
  }, txHost);
});
```

DB assertions also read through `txHost.tx`, so they see the uncommitted writes from the same transaction. See `test/shared/testing/expectations.ts`.

## Read-only vs mutating tests

- **Read-only** tests assert against committed seed rows and need no transaction.
- **Mutating** tests wrap their body in `isolateInTransaction(..., txHost)`.

## Rules of thumb

- Always read and write through `txHost.tx`, never a separate `DataSource`.
- Never commit a test transaction; throw the rollback sentinel.
- Freeze at an instant distinct from the fixture when updating a seeded row.
- Raise the pool per file with `poolSize`; don't inflate the global setting.
- Import with `.js` extensions (ESM + `nodenext`).
- Sequences and DDL do not roll back — use deterministic fixture ids where identity matters.
- Don't share mutable in-memory state across concurrent tests.

## Running the tests

```bash
make local-infra-up                          # Postgres + migrations + seeds
make test-int                                # all integration tests
make test-int FILES="test/integration/inventory/products-controller/products.integration-spec.ts"
npm test                                     # unit tests only
```

`make test-int` loads `.env` via `--env-file`; integration tests require a running Postgres.

## Limitations

This approach is tailored to Postgres + TypeORM + `nestjs-cls`. Writes must go through the transactional host, and a few true end-to-end tests are still worth keeping for concerns that cannot run inside a transaction.
