import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { CreateProductDto } from '../../../../../../src/inventory/dto/createProduct.dto.js';
import { productFactory } from '../../../../../../fixtures/inventory/products.factory.js';

export class CreateProductDtoBuilder {
  static defaultAll(): InjectionBuilder<CreateProductDto> {
    const productEntity = productFactory.build();
    return new InjectionBuilder<CreateProductDto>(new CreateProductDto()).with({
      name: productEntity.name,
      description: productEntity.description,
      quantity: productEntity.quantity,
    });
  }
}
