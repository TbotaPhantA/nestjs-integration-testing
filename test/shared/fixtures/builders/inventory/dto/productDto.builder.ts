import { ProductEntityBuilder } from '../entities/productEntity.builder.js';
import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { ProductDto } from '../../../../../../src/inventory/dto/product.dto.js';

export class ProductDtoBuilder {
  static defaultAll(): InjectionBuilder<ProductDto> {
    const productEntity = ProductEntityBuilder.defaultAll().result;

    return new InjectionBuilder<ProductDto>(new ProductDto()).with({
      id: productEntity.id.toString(),
      createdAt: productEntity.createdAt.toISOString(),
      updatedAt: productEntity.updatedAt.toISOString(),
      removedAt: productEntity.removedAt?.toISOString() ?? null,
      quantity: productEntity.quantity,
      name: productEntity.name,
      description: productEntity.description,
    });
  }
}
