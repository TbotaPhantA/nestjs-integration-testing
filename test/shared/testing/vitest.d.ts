import 'vitest';
import type { HttpStatus } from '@nestjs/common';
import type { ProductResponseDto } from '../../../src/inventory/dto/productResponseDto.js';
import type { ProductEntity } from '../../../src/inventory/entities/product.entity.js';
import type { ProductEventEntity } from '../../../src/inventory/entities/productEvent.entity.js';

declare module 'vitest' {
  interface Assertion<T = any> {
    toMatchStatus(status: HttpStatus): void;
    toMatchDto(dto: ProductResponseDto): void;
    toMatchEntity(entity: ProductEntity): Promise<void>;
    toMatchEvent(event: ProductEventEntity): Promise<void>;
  }
}
