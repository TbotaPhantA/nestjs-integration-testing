import { Test } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { test as vitestTest, vi } from 'vitest';
import { AppModule } from '../../../src/app.module.js';
import { isolateInTransaction } from '../utils/isolateInTransaction.js';

export interface TestAppContext {
  app: NestFastifyApplication;
  txHost: TransactionHost<TransactionalAdapterTypeOrm>;
  now: Date;
}

export interface TestAppOptions {
  freezeDate?: string;
}

export interface TestSuite {
  context: () => Promise<TestAppContext>;
  itTx: (title: string, fn: (ctx: TestAppContext) => Promise<void>) => void;
  teardown: () => Promise<void>;
}

export function createTestSuite(options: TestAppOptions = {}): TestSuite {
  let bootPromise: Promise<TestAppContext> | undefined;

  const boot = () => (bootPromise ??= bootTestApp(options));

  return {
    context: boot,

    itTx(title, fn) {
      vitestTest(title, async () => {
        const ctx = await boot();
        await isolateInTransaction(() => fn(ctx), ctx.txHost);
      });
    },

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
