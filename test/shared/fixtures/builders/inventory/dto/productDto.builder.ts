import { ProductEntityBuilder } from '../entities/productEntity.builder.js';
import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { ProductResponseDto } from '../../../../../../src/inventory/dto/productResponseDto.js';

export class ProductDtoBuilder {
  static defaultAll(): InjectionBuilder<ProductResponseDto> {
    const productEntity = ProductEntityBuilder.defaultAll().result;

    return new InjectionBuilder<ProductResponseDto>(new ProductResponseDto()).with({
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
