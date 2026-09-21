import { expect } from 'vitest';
import type { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import type { ProductResponseDto } from '../../../src/inventory/dto/productResponseDto.js';
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

export interface ExpectEntity {
  toMatchEntity(entity: ProductEntity): Promise<void>;
}

export interface ExpectEvent {
  toMatchEvent(event: ProductEventEntity): Promise<void>;
}

export function expectInDB(ctx: EntityMatchContext): ExpectEntity;
export function expectInDB(ctx: EventMatchContext): ExpectEvent;
export function expectInDB(
  ctx: EntityMatchContext | EventMatchContext,
): ExpectEntity | ExpectEvent {
  return expect(ctx);
}

expect.extend({
  toMatchDto(received: ProductResponseDto, expected: ProductResponseDto) {
    const pass = this.equals(received, expected);

    return {
      pass,
      message: () =>
        pass
          ? 'expected dto not to match'
          : `expected dto ${this.utils.stringify(expected)} but got ${this.utils.stringify(received)}`,
    };
  },

  async toMatchEntity(received: EntityMatchContext, expected: ProductEntity) {
    let actual: ProductEntity;
    try {
      actual = await received.txHost.tx
        .getRepository(ProductEntity)
        .findOneOrFail({ where: { id: received.id } });
    } catch {
      return {
        pass: false,
        message: () =>
          `expected a product with id ${received.id} to exist in the transaction but it was not found`,
      };
    }

    const pass = this.equals(actual, expected);

    return {
      pass,
      message: () =>
        pass
          ? 'expected entity not to match'
          : `expected entity ${this.utils.stringify(expected)} but got ${this.utils.stringify(actual)}`,
    };
  },

  async toMatchEvent(
    received: EventMatchContext,
    expected: ProductEventEntity,
  ) {
    let actual: ProductEventEntity;
    try {
      actual = await received.txHost.tx
        .getRepository(ProductEventEntity)
        .findOneOrFail({
          where: { aggregateId: received.aggregateId },
          order: { messageId: 'DESC' },
        });
    } catch {
      return {
        pass: false,
        message: () =>
          `expected an event for product ${received.aggregateId} to exist in the transaction but it was not found`,
      };
    }

    const { messageId: _messageId, ...rest } = expected;
    const pass = this.equals(actual, {
      ...rest,
      messageId: expect.any(String),
    });

    return {
      pass,
      message: () =>
        pass
          ? 'expected event not to match'
          : `expected event ${this.utils.stringify(expected)} but got ${this.utils.stringify(actual)}`,
    };
  },
});
