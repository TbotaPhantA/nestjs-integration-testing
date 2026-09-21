import { expect } from 'vitest';
import type { HttpStatus } from '@nestjs/common';
import type { ProductDto } from '../../../src/inventory/dto/product.dto.js';
import type { ProductEntity } from '../../../src/inventory/entities/product.entity.js';
import type { ProductEventEntity } from '../../../src/inventory/entities/productEvent.entity.js';

interface HttpResponseLike {
  statusCode: HttpStatus;
}

expect.extend({
  toRespondWith(received: HttpResponseLike, expected: HttpStatus) {
    const pass = received.statusCode === expected;

    return {
      pass,
      message: () =>
        pass
          ? `expected response status not to be ${expected}`
          : `expected response status to be ${expected}, but got ${received.statusCode}`,
    };
  },

  toMatchDto(received: ProductDto, expected: ProductDto) {
    const pass = this.equals(received, expected);

    return {
      pass,
      message: () =>
        pass
          ? 'expected dto not to match'
          : `expected dto ${this.utils.stringify(expected)} but got ${this.utils.stringify(received)}`,
    };
  },

  toMatchEntity(received: ProductEntity, expected: ProductEntity) {
    const pass = this.equals(received, expected);

    return {
      pass,
      message: () =>
        pass
          ? 'expected entity not to match'
          : `expected entity ${this.utils.stringify(expected)} but got ${this.utils.stringify(received)}`,
    };
  },

  toMatchEvent(received: ProductEventEntity, expected: ProductEventEntity) {
    const { messageId: _messageId, ...rest } = expected;
    const pass = this.equals(received, {
      ...rest,
      messageId: expect.any(String),
    });

    return {
      pass,
      message: () =>
        pass
          ? 'expected event not to match'
          : `expected event ${this.utils.stringify(expected)} but got ${this.utils.stringify(received)}`,
    };
  },
});
