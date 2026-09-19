import { ProductEntity } from '../../src/inventory/entities/product.entity.js';
import {
  ProductEntityBuilder,
  ProductFixtureNamesEnum,
} from '../../test/shared/fixtures/builders/inventory/entities/productEntity.builder.js';

export const CreatedProductSeed = {
  entity: ProductEntity,
  data: ProductEntityBuilder[ProductFixtureNamesEnum.CREATED_PRODUCT].result,
} as const;