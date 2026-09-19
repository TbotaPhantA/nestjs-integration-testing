import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { ProductEntity } from '../../../../../../src/inventory/entities/product.entity.js';
import { hashInt8 } from '../../../../utils/hashes/hashInt8.js';

export enum ProductFixtureNamesEnum {
  CREATED_PRODUCT='CREATED_PRODUCT',
}

export class ProductEntityBuilder {
  static get [ProductFixtureNamesEnum.CREATED_PRODUCT](): InjectionBuilder<ProductEntity> {
    return new InjectionBuilder<ProductEntity>(new ProductEntity())
      .with({
        id: hashInt8(ProductFixtureNamesEnum.CREATED_PRODUCT),
        createdAt: new Date(2000, 0, 1),
        updatedAt: new Date(2000, 0, 1),
        removedAt: null,
        quantity: 5,
        name: 'name',
        description: 'description'
      })
  }
}
