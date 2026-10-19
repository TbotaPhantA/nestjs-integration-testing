import { Factory } from 'fishery';
import { ProductEntity } from '../../src/inventory/entities/product.entity.js';

export const productFactory = Factory.define<ProductEntity>(() =>
  ProductEntity.createFromRaw({
    id: '1',
    createdAt: new Date('2000-01-01T00:00:00.000Z'),
    updatedAt: new Date('2000-01-01T00:00:00.000Z'),
    removedAt: null,
    quantity: 5,
    name: 'name',
    description: 'description',
  }),
);
