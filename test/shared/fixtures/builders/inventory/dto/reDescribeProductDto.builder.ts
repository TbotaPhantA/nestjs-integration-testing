import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { ReDescribeProductDto } from '../../../../../../src/inventory/dto/reDescribeProduct.dto.js';
import { ProductEntityBuilder } from '../entities/productEntity.builder.js';

export class ReDescribeProductDtoBuilder {
  static get defaultAll(): InjectionBuilder<ReDescribeProductDto> {
    const defaultProduct = ProductEntityBuilder['DEFAULT_PRODUCT'].result

    return new InjectionBuilder<ReDescribeProductDto>(new ReDescribeProductDto())
      .with({
        productId: defaultProduct.id,
        name: 'name',
        description: 'description',
      })
  }
}
