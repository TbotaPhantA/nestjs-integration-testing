import { hashInt8 } from '../../utils/hashes/hashInt8.js';
import { ProductEntityBuilder } from '../builders/inventory/entities/productEntity.builder.js';
import { InjectionBuilder } from '../../utils/injectionBuilder.js';

export enum ProductFixtureNamesEnum {
  DEFAULT_PRODUCT = 'DEFAULT_PRODUCT',
}

export interface ProductFixture {
  name: ProductFixtureNamesEnum;
  id: string;
  value: () => InjectionBuilder<ProductEntityBuilder>;
}

export const ProductFixtures = {
  [ProductFixtureNamesEnum.DEFAULT_PRODUCT]: {
    name: ProductFixtureNamesEnum.DEFAULT_PRODUCT,
    id: hashInt8(ProductFixtureNamesEnum.DEFAULT_PRODUCT).toString(),
    value: () => ProductEntityBuilder.defaultAll().with({ id: hashInt8(ProductFixtureNamesEnum.DEFAULT_PRODUCT).toString() }),
  },
} satisfies Record<ProductFixtureNamesEnum, ProductFixture>;

