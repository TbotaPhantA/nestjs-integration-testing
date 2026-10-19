import { ProductEntity } from '../../src/inventory/entities/product.entity.js';
import { defineFixtures } from '../defineFixtures.js';
import { ProductEntityBuilder } from '../../test/shared/fixtures/builders/inventory/entities/productEntity.builder.js';
import type { ObjectLiteral, EntityTarget } from 'typeorm';

export const productFixtures = defineFixtures({
  DEFAULT_PRODUCT: (id: string) => [
    {
      entity: ProductEntity as unknown as EntityTarget<ObjectLiteral>,
      data: ProductEntityBuilder.defaultAll().with({ id }).result,
    },
  ],
});
