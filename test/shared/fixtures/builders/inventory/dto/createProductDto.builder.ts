import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { CreateProductDto } from '../../../../../../src/inventory/dto/createProduct.dto.js';
import { ProductEntityBuilder } from '../entities/productEntity.builder.js';

export class CreateProductDtoBuilder {
  static defaultAll(): InjectionBuilder<CreateProductDto> {
    const productEntity = ProductEntityBuilder.defaultAll().result;
    return new InjectionBuilder<CreateProductDto>(new CreateProductDto()).with({
      name: productEntity.name,
      description: productEntity.description,
      quantity: productEntity.quantity,
    });
  }
}
