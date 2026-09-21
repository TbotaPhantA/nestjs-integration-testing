import { hashInt8 } from '../../utils/hashes/hashInt8.js';

export enum ProductFixtureNamesEnum {
  DEFAULT_PRODUCT = 'DEFAULT_PRODUCT',
}

export interface ProductFixture {
  name: ProductFixtureNamesEnum;
  id: string;
}

export const ProductFixtures = {
  [ProductFixtureNamesEnum.DEFAULT_PRODUCT]: productFixture(
    ProductFixtureNamesEnum.DEFAULT_PRODUCT,
  ),
} satisfies Record<ProductFixtureNamesEnum, ProductFixture>;

function productFixture(name: ProductFixtureNamesEnum): ProductFixture {
  const id = hashInt8(name).toString();

  return {
    name,
    id,
  };
}
