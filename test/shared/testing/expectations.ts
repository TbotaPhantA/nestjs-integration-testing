import { expect } from 'vitest';
import type { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ProductEntity } from '../../../src/inventory/entities/product.entity.js';
import { ProductEventEntity } from '../../../src/inventory/entities/productEvent.entity.js';

export interface EntityMatchContext {
  txHost: TransactionHost<TransactionalAdapterTypeOrm>;
  id: string;
}

export interface EventMatchContext {
  txHost: TransactionHost<TransactionalAdapterTypeOrm>;
  aggregateId: string;
}

export interface ProductDBExpectation {
  toStrictEqual(expected: ProductEntity | undefined): Promise<void>;
}

export interface ProductEventDBExpectation {
  toStrictEqual(expected: ProductEventEntity | undefined): Promise<void>;
}

export function expectProductInDB(
  ctx: EntityMatchContext,
): ProductDBExpectation {
  return {
    async toStrictEqual(expected) {
      const actual = await ctx.txHost.tx
        .getRepository(ProductEntity)
        .findOne({ where: { id: ctx.id } });

      expect(actual).toStrictEqual(expected);
    },
  };
}

export function expectProductEventInDB(
  ctx: EventMatchContext,
): ProductEventDBExpectation {
  return {
    async toStrictEqual(expected) {
      const actual = await ctx.txHost.tx
        .getRepository(ProductEventEntity)
        .findOne({
          where: { aggregateId: ctx.aggregateId },
          order: { messageId: 'DESC' },
        });

      if (!expected) {
        expect(actual).toStrictEqual(expected)
      } else {
        const { messageId: _messageId, ...rest } = expected;

        expect(actual).toStrictEqual(
          ProductEventEntity.createFromRaw({
            ...rest,
            messageId: expect.any(String) as unknown as string,
          }),
        );
      }
    },
  };
}
