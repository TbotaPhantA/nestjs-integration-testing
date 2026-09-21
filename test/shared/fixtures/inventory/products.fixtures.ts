import { hashInt8 } from '../../utils/hashes/hashInt8.js';
import { InjectionBuilder } from '../../utils/injectionBuilder.js';
import { CreateProductDto } from '../../../../src/inventory/dto/createProduct.dto.js';
import { ProductDto } from '../../../../src/inventory/dto/product.dto.js';
import { ReDescribeProductDto } from '../../../../src/inventory/dto/reDescribeProduct.dto.js';
import { ProductEntity } from '../../../../src/inventory/entities/product.entity.js';
import { ProductEventEntity } from '../../../../src/inventory/entities/productEvent.entity.js';
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
  entity: () => InjectionBuilder<ProductEntity>;
  dto: () => InjectionBuilder<ProductDto>;
  event: () => InjectionBuilder<ProductEventEntity>;
  createDto: () => InjectionBuilder<CreateProductDto>;
  reDescribeDto: () => InjectionBuilder<ReDescribeProductDto>;
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
    entity: () => ProductEntityBuilder.defaultAll().with({ id }),
    dto: () => ProductDtoBuilder.defaultAll().with({ id }),
    event: () =>
      ProductEventEntityBuilder.defaultAll().with({ aggregateId: id }),
    createDto: () => CreateProductDtoBuilder.defaultAll(),
    reDescribeDto: () =>
      ReDescribeProductDtoBuilder.defaultAll().with({ productId: id }),
  };
}
