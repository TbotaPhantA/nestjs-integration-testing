import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { vi } from 'vitest';

export interface TestAppContext {
  app: NestFastifyApplication;
  txHost: TransactionHost<TransactionalAdapterTypeOrm>;
  now: Date;
}

export interface TestAppOptions {
  freezeDate?: string;
  poolSize?: number;
}

export interface TestSuite {
  context: () => Promise<TestAppContext>;
  teardown: () => Promise<void>;
}

export function createTestSuite(options: TestAppOptions = {}): TestSuite {
  let bootPromise: Promise<TestAppContext> | undefined;

  const boot = () => (bootPromise ??= bootTestApp(options));

  return {
    context: boot,

    async teardown() {
      if (!bootPromise) return;

      const ctx = await bootPromise;
      await ctx.app.close();
      vi.useRealTimers();
    },
  };
}

async function bootTestApp(options: TestAppOptions): Promise<TestAppContext> {
  const now = options.freezeDate ? new Date(options.freezeDate) : new Date();

  if (options.freezeDate) {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
  }

  if (options.poolSize != null) {
    process.env.DB_POOL_SIZE = String(options.poolSize);
  }

  const { AppModule } = await import('../../../src/app.module.js');

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const txHost = app.get(TransactionHost<TransactionalAdapterTypeOrm>);

  return { app, txHost, now };
}
