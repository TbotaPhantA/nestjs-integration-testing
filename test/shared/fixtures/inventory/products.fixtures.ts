import { hashInt8 } from '../../utils/hashes/hashInt8.js';
import { ProductEntityBuilder } from '../builders/inventory/entities/productEntity.builder.js';
import { InjectionBuilder } from '../../utils/injectionBuilder.js';

export interface ProductFixture {
  name: string;
  id: string;
  value: () => InjectionBuilder<ProductEntityBuilder>;
}

type ProductFixtureFactory = (
  id: string,
) => InjectionBuilder<ProductEntityBuilder>;

function defineProductFixtures<T extends Record<string, ProductFixtureFactory>>(
  factories: T,
): { [K in keyof T]: ProductFixture & { name: K } } {
  return Object.fromEntries(
    Object.entries(factories).map(([name, factory]) => {
      const id = hashInt8(name).toString();
      return [name, { name, id, value: () => factory(id) }];
    }),
  ) as { [K in keyof T]: ProductFixture & { name: K } };
}

export const ProductFixtures = defineProductFixtures({
  DEFAULT_PRODUCT: (id) => ProductEntityBuilder.defaultAll().with({ id }),
});
