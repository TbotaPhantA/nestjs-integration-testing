import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { ProductEntity } from '../../../../../../src/inventory/entities/product.entity.js';
import { hashInt2 } from '../../../../../../fixtures/hashes/hashInt2.js';

export const ProductFixtureNames = {
  DEFAULT_PRODUCT: 'DEFAULT_PRODUCT',
} as const;

export type ProductFixtureName =
  (typeof ProductFixtureNames)[keyof typeof ProductFixtureNames];

export class ProductEntityBuilder {
  static defaultAll(): InjectionBuilder<ProductEntity> {
    return new InjectionBuilder<ProductEntity>(new ProductEntity()).with({
      id: '1',
      createdAt: new Date('2000-01-01T00:00:00.000Z'),
      updatedAt: new Date('2000-01-01T00:00:00.000Z'),
      removedAt: null,
      quantity: 5,
      name: 'name',
      description: 'description',
    });
  }

  static get [ProductFixtureNames.DEFAULT_PRODUCT](): InjectionBuilder<ProductEntity> {
    return ProductEntityBuilder.defaultAll().with({
      id: hashInt2(ProductFixtureNames.DEFAULT_PRODUCT).toString(),
    });
  }
}
