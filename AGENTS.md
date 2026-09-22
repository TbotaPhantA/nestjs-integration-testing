# AGENTS.md

## Quick commands

- `make start-dev` — dev server (uses `--env-file=.env`, loads env vars itself, not via dotenv)
- `make local-infra-up` — start Postgres, run migrations, seed data
- `make local-infra-down` — stop Postgres
- `make local-infra-restart` — full restart
- `npm test` — unit tests only (`*.spec.ts`)
- `npm run test:integration` — integration tests (`*.integration-spec.ts`), requires running Postgres
- `npm run lint` — oxlint (not ESLint)
- `npm run format` — prettier (single quotes, trailing commas)
- `npm run build` — nest build, output to `dist/`
- `make test-int` — run all integration tests (equivalent to `npm run test:integration`, but loads env via `--env-file=.env`); requires running Postgres. Filter to specific file(s) with `FILES`, e.g. `make test-int FILES="test/integration/inventory/products-controller/findById.integration-spec.ts"`

## Architecture

- **NestJS + Fastify** (not Express) — app listens on `config.port` (default `4444` from `.env`)
- **TypeORM + Postgres** — single DB, entities in `src/inventory/entities/`, migrations in `migrations/`
- **CLS Transactional** (`nestjs-cls` + `@nestjs-cls/transactional-adapter-typeorm`) — provides `TransactionHost` for programmatic transactions
- **Event sourcing on entities** — `ProductEntity` accumulates `#uncommittedEvents` (private field) via domain methods, exported via `exportEvents()` after insertion
- Single domain module: `InventoryModule` in `src/inventory/`
- Infrastructure/shared code lives in `src/shared/infra/`

## Critical import convention

All `.ts` files import with `.js` extensions — required by `moduleResolution: "nodenext"` + ESM (`"type": "module"` in package.json). Writing `import { x } from './foo.js'` for `./foo.ts` is correct. Importing `.ts` directly will break.

## Integration test conventions

- Integration tests live in `test/integration/` and use `*.integration-spec.ts` naming
- They use a **separate vitest config** (`vitest.config.integration.ts`) from unit tests; no setup files are registered — assertions rely on the native vitest `expect`
- Spin up the app with `const testApp = createTestSuite({ freezeDate?: string })` from `test/shared/testing/test-suite.ts`; call `await testApp.teardown()` in `afterAll`
- **Write tests** (mutating DB) use `testApp.itTx(title, fn)` — the body runs inside a DB transaction that rolls back (isolation via `isolateInTransaction`), preventing test pollution. The body receives `{ app, txHost, now }`
- **Read-only tests** (asserting against committed seed rows) use the regular global `it` and fetch the context with `await testApp.context()`
- Concurrency is opt-in: wrap a block in `describe.concurrent`. Each test *file* runs in its own worker with its own app + connection pool, so within-file parallelism is capped by the pool size (`DB_POOL_SIZE`); across files it's free
- A single file can raise its own pool headroom for concurrent tests by passing `poolSize` to the suite: `createTestSuite({ freezeDate?, poolSize? })` — this overrides `DB_POOL_SIZE` before the app boots (each file has its own fork, so the override never leaks across files). Files that omit it keep `.env`'s `DB_POOL_SIZE`
- `freezeDate` fakes `Date` for the whole file (one frozen clock). Tests derive expected timestamps from the `now` in the itTx context; fixtures carry UTC instants
- Write flows that **modify a seeded row** must freeze at an instant *distinct* from the fixture's — meeting the seed's timestamp makes TypeORM regenerate the update-date as real time. `re-describe` therefore freezes at `2000-01-02` while the seed carries `2000-01-01`
- HTTP calls go through per-controller clients (e.g. `productsClient(app)` from `test/shared/clients/products.client.ts`), which encapsulate method, path, and DTO parsing
- Assertions use the native vitest `expect`: `toStrictEqual`/`toEqual` for HTTP responses, DTOs, and status codes (e.g. `expect(response.statusCode).toStrictEqual(HttpStatus.OK)`); DB state goes through `expectProductInDB({ txHost, id })` and `expectProductEventInDB({ txHost, aggregateId })` (from `test/shared/testing/expectations.ts`) — the chainable helper loads the row from the transaction itself and asserts with native `expect(actual).toStrictEqual(expected)` (`expectProductEventInDB` ignores `messageId`), keeping failure output identical to native vitest
- Committed seed rows are a deliberate, Rails-fixtures-style pattern: `findById`-style reads reference `ProductFixtures[Enum]` whose deterministic `id` is `hashInt8(name)`. Seeding stays a dev-ops prerequisite (`make local-infra-up` / `make seeds-up`)

## Test fixtures

- `test/shared/fixtures/inventory/products.fixtures.ts` — the fixture registry: `ProductFixtureNamesEnum` (names) + `ProductFixtures[Enum]` exposing `{ name, id, entity, dto, event, createDto, reDescribeDto }` builder factories with the hash-derived id pre-applied
- Builders live in `test/shared/fixtures/builders/inventory/` — builder pattern using `InjectionBuilder<T>` with `.with({...})` and `.omit(...)` methods; every factory is a `defaultAll()` method and returns a fresh builder
- Builder defaults carry the placeholder id `'1'`; the fixture registry overrides it with `hashInt8(fixtureName)`
- Access the final value via `.result` on the builder; each `.defaultAll()` call returns a new builder so `.with(...)` never leaks state
- `seeds/` consumes the same fixture registry (`seeds/fixtures/products.ts`), keeping dev seeding and test fixtures in one place
- `test/shared/fixtures/builders/inventory/dto/errorResponseBody.builder.ts` — builds the error payload shape (`{ statusCode, message, error }`) for unhappy-path assertions; `ProductsClient` returns raw parsed JSON for HTTP >= 400, so the body is a plain object that `toStrictEqual` matches against this builder's `.result`

## Database / migrations

- `.env` is gitignored — a committed example lives at root (PORT=4444, DB_PORT=5444, DB_POOL_SIZE=2)
- `make autogenerate-migrations name=X` generates a migration diff from the live DB
- `make migrations-up` / `make migrations-down` to apply/revert
- `DB_POOL_SIZE=2` in `.env` is intentionally low for test isolation — do not increase without understanding parallel test impact

## Linting & formatting

- **oxlint** (not ESLint): configured in `oxlint.json`, runs via `npm run lint`
- `@typescript-eslint/no-floating-promises` is set to `warn` — ensure async calls are awaited
- Prettier: single quotes, trailing commas everywhere
- No `build`/`typecheck` script exists — `nest build` is the compile step
