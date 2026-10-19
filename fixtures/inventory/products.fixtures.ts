import { ProductEntity } from '../../src/inventory/entities/product.entity.js';
import { defineFixtures } from '../defineFixtures.js';
import { productFactory } from './products.factory.js';
import type { ObjectLiteral, EntityTarget } from 'typeorm';

export const productFixtures = defineFixtures({
  DEFAULT_PRODUCT: (id: string) => [
    {
      entity: ProductEntity as EntityTarget<ObjectLiteral>,
      data: productFactory.params({ id }).build(),
    },
  ],
});
