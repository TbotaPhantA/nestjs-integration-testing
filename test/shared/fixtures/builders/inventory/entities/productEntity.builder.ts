import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { ProductEntity } from '../../../../../../src/inventory/entities/product.entity.js';

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
}
