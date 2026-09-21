import { hashInt8 } from '../../utils/hashes/hashInt8.js';
import { InjectionBuilder } from '../../utils/injectionBuilder.js';
import { CreateProductDto } from '../../../../src/inventory/dto/createProduct.dto.js';
import { ProductResponseDto } from '../../../../src/inventory/dto/productResponseDto.js';
import { ReDescribeProductDto } from '../../../../src/inventory/dto/reDescribeProduct.dto.js';
import { ProductEntity } from '../../../../src/inventory/entities/product.entity.js';
import { ProductEventEntity, ProductEventNameEnum } from '../../../../src/inventory/entities/productEvent.entity.js';
import { CreateProductDtoBuilder } from '../builders/inventory/dto/createProductDto.builder.js';
import { ProductDtoBuilder } from '../builders/inventory/dto/productDto.builder.js';
import { ReDescribeProductDtoBuilder } from '../builders/inventory/dto/reDescribeProductDto.builder.js';
import { ProductEntityBuilder } from '../builders/inventory/entities/productEntity.builder.js';
import { ProductEventEntityBuilder } from '../builders/inventory/entities/productEventEntity.builder.js';

export enum ProductFixtureNamesEnum {
  DEFAULT_PRODUCT = 'DEFAULT_PRODUCT',
}

export interface ProductFixture {
  name: ProductFixtureNamesEnum;
  id: string;
  makeEntity: () => InjectionBuilder<ProductEntity>;
  makeResponseDto: () => InjectionBuilder<ProductResponseDto>;
  makeEvent: (eventName: ProductEventNameEnum) => InjectionBuilder<ProductEventEntity>;
  makeCreateDto: () => InjectionBuilder<CreateProductDto>;
  makeReDescribeDto: () => InjectionBuilder<ReDescribeProductDto>;
}

export const ProductFixtures = {
  [ProductFixtureNamesEnum.DEFAULT_PRODUCT]: productFixture(
    ProductFixtureNamesEnum.DEFAULT_PRODUCT,
  ),
} satisfies Record<ProductFixtureNamesEnum, ProductFixture>;

function productFixture(name: ProductFixtureNamesEnum): ProductFixture {
  const id = hashInt8(name).toString();

  return {
    name,
    id,
    makeEntity: () => ProductEntityBuilder.defaultAll().with({ id }),
    makeResponseDto: () => ProductDtoBuilder.defaultAll().with({ id }),
    makeEvent: (eventName: ProductEventNameEnum) =>
      ProductEventEntityBuilder.defaultAll().with({ aggregateId: id, eventName }),
    makeCreateDto: () => CreateProductDtoBuilder.defaultAll(),
    makeReDescribeDto: () =>
      ReDescribeProductDtoBuilder.defaultAll().with({ productId: id }),
  };
}
