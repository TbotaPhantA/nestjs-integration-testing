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
- `make test-int FILES=<pattern>` — run specific integration test file(s)

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
- They use a **separate vitest config** (`vitest.config.integration.ts`) from unit tests
- Every integration test body must be wrapped in `isolateInTransaction(callback, txHost)` — this runs the test inside a DB transaction then rolls back, preventing test pollution
- Obtain `txHost` via `app.get(TransactionHost<TransactionalAdapterTypeOrm>)` in `beforeAll`
- Integration tests use `vi.useFakeTimers()` to freeze `Date` — call `vi.useRealTimers()` in `afterAll`
- Integration tests spin up a full NestJS app with FastifyAdapter; call both `app.init()` and `app.getHttpAdapter().getInstance().ready()` before injecting requests
- Use `app.inject({ method, url, body })` for HTTP assertions (not supertest)

## Test fixtures

- `test/shared/fixtures/builders/` — builder pattern using `InjectionBuilder<T>` with `.with({...})` and `.omit(...)` methods
- Builder classes export static named factories (e.g., `CreateProductDtoBuilder.defaultAll()`, `ProductDtoBuilder['DEFAULT_PRODUCT']`)
- Access the final value via `.result` on the builder

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
