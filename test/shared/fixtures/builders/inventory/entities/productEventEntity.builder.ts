import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import {
  ProductEventEntity,
  ProductEventNameEnum,
} from '../../../../../../src/inventory/entities/productEvent.entity.js';
import { ProductDtoBuilder } from '../dto/productDto.builder.js';

export class ProductEventEntityBuilder {
  static defaultAll(): InjectionBuilder<ProductEventEntity> {
    return new InjectionBuilder<ProductEventEntity>(
      new ProductEventEntity(),
    ).with({
      messageId: '1',
      createdAt: new Date('2000-01-01T00:00:00.000Z'),
      eventName: ProductEventNameEnum.PRODUCT_WAS_CREATED,
      aggregateId: '1',
      value: ProductDtoBuilder.defaultAll().result,
    });
  }
}
