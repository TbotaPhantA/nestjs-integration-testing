import { ProductEntity } from '../../src/inventory/entities/product.entity.js';
import {
  ProductFixtureNamesEnum,
  ProductFixtures,
} from '../../test/shared/fixtures/inventory/products.fixtures.js';

export const CreatedProductSeed = {
  entity: ProductEntity,
  data: ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT].entity().result,
} as const;