import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { CreateProductDto } from '../../../../../../src/inventory/dto/createProduct.dto.js';

export class CreateProductDtoBuilder {
  static defaultAll(): InjectionBuilder<CreateProductDto> {
    return new InjectionBuilder<CreateProductDto>(new CreateProductDto())
      .with({
        name: 'name',
        description: 'description',
        quantity: 5,
      })
  }
}
