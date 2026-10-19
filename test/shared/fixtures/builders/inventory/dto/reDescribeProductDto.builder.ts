import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { ReDescribeProductDto } from '../../../../../../src/inventory/dto/reDescribeProduct.dto.js';
import { productFactory } from '../../../../../../fixtures/inventory/products.factory.js';

export class ReDescribeProductDtoBuilder {
  static defaultAll(): InjectionBuilder<ReDescribeProductDto> {
    const defaultProduct = productFactory.build();

    return new InjectionBuilder<ReDescribeProductDto>(
      new ReDescribeProductDto(),
    ).with({
      productId: defaultProduct.id,
      name: defaultProduct.name,
      description: defaultProduct.description,
    });
  }
}
