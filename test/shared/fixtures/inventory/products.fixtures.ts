import { hashInt8 } from '../../utils/hashes/hashInt8.js';
import { ProductEntityBuilder } from '../builders/inventory/entities/productEntity.builder.js';
import { InjectionBuilder } from '../../utils/injectionBuilder.js';

export enum ProductFixtureNamesEnum {
  DEFAULT_PRODUCT = 'DEFAULT_PRODUCT',
  NON_EXISTENT_PRODUCT = 'NON_EXISTENT_PRODUCT',
}

export interface ProductFixture {
  name: ProductFixtureNamesEnum;
  id: string;
  value: () => InjectionBuilder<ProductEntityBuilder>;
}

export const ProductFixtures = {
  [ProductFixtureNamesEnum.DEFAULT_PRODUCT]: productFixture(
    ProductFixtureNamesEnum.DEFAULT_PRODUCT,
  ),
  [ProductFixtureNamesEnum.NON_EXISTENT_PRODUCT]: productFixture(
    ProductFixtureNamesEnum.NON_EXISTENT_PRODUCT,
  ),
} satisfies Record<ProductFixtureNamesEnum, ProductFixture>;

function productFixture(name: ProductFixtureNamesEnum): ProductFixture {
  const id = hashInt8(name).toString();

  return {
    name,
    id,
    value: () => ProductEntityBuilder.defaultAll().with({ id }),
  };
}
