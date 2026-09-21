import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { test as vitestTest, vi } from 'vitest';
import { isolateInTransaction } from '../utils/isolateInTransaction.js';

export interface TestAppContext {
  app: NestFastifyApplication;
  txHost: TransactionHost<TransactionalAdapterTypeOrm>;
  now: Date;
}

export interface TestAppOptions {
  freezeDate?: string;
  poolSize?: number;
}

type ItTxEach = {
  <T extends readonly any[] | readonly [any]>(
    cases: readonly T[],
  ): (
    title: string,
    fn: (ctx: TestAppContext, ...args: T) => Promise<void>,
  ) => void;
  <T>(
    cases: readonly T[],
  ): (
    title: string,
    fn: (ctx: TestAppContext, args: T) => Promise<void>,
  ) => void;
};

export interface TestSuite {
  context: () => Promise<TestAppContext>;
  itTx: {
    (title: string, fn: (ctx: TestAppContext) => Promise<void>): void;
    each: ItTxEach;
  };
  teardown: () => Promise<void>;
}

export function createTestSuite(options: TestAppOptions = {}): TestSuite {
  let bootPromise: Promise<TestAppContext> | undefined;

  const boot = () => (bootPromise ??= bootTestApp(options));

  const itTx = Object.assign(
    (title: string, fn: (ctx: TestAppContext) => Promise<void>) => {
      vitestTest(title, async () => {
        const ctx = await boot();
        await isolateInTransaction(() => fn(ctx), ctx.txHost);
      });
    },
    {
      each: ((cases: unknown) =>
        (title: string, fn: (...args: unknown[]) => Promise<void>) => {
          (vitestTest.each as any)(cases)(title, async (...args: unknown[]) => {
            const ctx = await boot();
            await isolateInTransaction(() => fn(ctx, ...args), ctx.txHost);
          });
        }) as ItTxEach,
    },
  );

  return {
    context: boot,
    itTx,

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
