import { ProductEntity } from '../../src/inventory/entities/product.entity.js';
import { productFixtures } from '../../fixtures/inventory/products.fixtures.js';

export const CreatedProductSeed = {
  entity: ProductEntity,
  data: productFixtures.DEFAULT_PRODUCT.rows[0].data,
} as const;
