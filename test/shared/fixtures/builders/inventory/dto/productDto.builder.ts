import { InjectionBuilder } from '../../../../utils/injectionBuilder.js';
import { ProductResponseDto } from '../../../../../../src/inventory/dto/productResponseDto.js';
import { productFactory } from '../../../../../../fixtures/inventory/products.factory.js';

export class ProductDtoBuilder {
  static defaultAll(): InjectionBuilder<ProductResponseDto> {
    const productEntity = productFactory.build();

    return new InjectionBuilder<ProductResponseDto>(
      new ProductResponseDto(),
    ).with({
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
