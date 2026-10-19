import { ProductEntity } from '../../src/inventory/entities/product.entity.js';
import {
  ProductEntityBuilder,
  ProductFixtureNames,
} from '../../test/shared/fixtures/builders/inventory/entities/productEntity.builder.js';

export const CreatedProductSeed = {
  entity: ProductEntity,
  data: ProductEntityBuilder[ProductFixtureNames.DEFAULT_PRODUCT].result,
} as const;
