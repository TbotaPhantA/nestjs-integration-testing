import 'vitest';
import type { HttpStatus } from '@nestjs/common';
import type { ProductDto } from '../../../src/inventory/dto/product.dto.js';
import type { ProductEntity } from '../../../src/inventory/entities/product.entity.js';
import type { ProductEventEntity } from '../../../src/inventory/entities/productEvent.entity.js';

declare module 'vitest' {
  interface Assertion<T = any> {
    toRespondWith(status: HttpStatus): void;
    toMatchDto(dto: ProductDto): void;
    toMatchEntity(entity: ProductEntity): void;
    toMatchEvent(event: ProductEventEntity): void;
  }

  interface AsymmetricMatchersContaining {}
}
