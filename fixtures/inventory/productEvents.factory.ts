import { Factory } from 'fishery';
import {
  ProductEventEntity,
  ProductEventNameEnum,
} from '../../src/inventory/entities/productEvent.entity.js';
import { ProductResponseDto } from '../../src/inventory/dto/productResponseDto.js';
import { productFactory } from './products.factory.js';

export const productEventFactory = Factory.define<ProductEventEntity>(() =>
  ProductEventEntity.createFromRaw({
    messageId: '1',
    createdAt: new Date('2000-01-01T00:00:00.000Z'),
    eventName: ProductEventNameEnum.PRODUCT_WAS_CREATED,
    aggregateId: '1',
    value: ProductResponseDto.from(productFactory.params({ id: '1' }).build()),
  }),
);
