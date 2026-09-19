import { ProductEntityBuilder, ProductFixtureNamesEnum } from '../entities/productEntity.builder.js';
import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { ProductDto } from '../../../../../../src/inventory/dto/product.dto.js';

export class ProductDtoBuilder {
  static get [ProductFixtureNamesEnum.CREATED_PRODUCT](): InjectionBuilder<ProductDto> {
    const productEntity = ProductEntityBuilder['CREATED_PRODUCT'].result;

    return new InjectionBuilder<ProductDto>(new ProductDto())
      .with({
        id: productEntity.id.toString(),
        createdAt: productEntity.createdAt,
        updatedAt: productEntity.updatedAt,
        removedAt: productEntity.removedAt,
        quantity: productEntity.quantity,
        name: productEntity.name,
        description: productEntity.description,
      })
  }
}
