import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/createProduct.dto.js';
import { ProductRepository } from './repositories/product.repository.js';
import { ProductResponseDto } from './dto/productResponseDto.js';
import { ProductEntity } from './entities/product.entity.js';
import { ProductEventRepository } from './repositories/productEvent.repository.js';
import { ReDescribeProductDto } from './dto/reDescribeProduct.dto.js';
import { ChangeQuantityDto } from './dto/changeQuantity.dto.js';
import { Propagation, Transactional } from '@nestjs-cls/transactional';
import { assertTruthy } from '../shared/utils/assert/assertTruthy.js';

@Injectable()
export class ProductService {
  constructor(
    private readonly repo: ProductRepository,
    private readonly eventsRepo: ProductEventRepository,
  ) {}

  async findById(productId: string): Promise<ProductResponseDto> {
    const product = await this.getById(productId);
    return ProductResponseDto.from(product);
  }

  @Transactional(Propagation.Nested)
  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const product = ProductEntity.createByDto(dto);
    const savedProduct = await this.saveWithEvents(product);
    return ProductResponseDto.from(savedProduct);
  }

  @Transactional(Propagation.Nested)
  async reDescribe(dto: ReDescribeProductDto): Promise<ProductResponseDto> {
    const product = await this.getById(dto.productId);
    product.reDescribe(dto);
    const savedProduct = await this.saveWithEvents(product);
    return ProductResponseDto.from(savedProduct);
  }

  @Transactional(Propagation.Nested)
  async changeQuantity(dto: ChangeQuantityDto): Promise<ProductResponseDto> {
    const product = await this.getById(dto.productId);
    product.changeQuantity(dto);
    const savedProduct = await this.saveWithEvents(product);
    return ProductResponseDto.from(savedProduct);
  }

  @Transactional(Propagation.Nested)
  async delete(productId: string): Promise<ProductResponseDto> {
    const product = await this.getById(productId);
    product.markAsDeleted();
    const savedProduct = await this.saveWithEvents(product);
    return ProductResponseDto.from(savedProduct);
  }

  private async getById(productId: string): Promise<ProductEntity> {
    const product = await this.repo.findById(productId);
    assertTruthy(
      product,
      new BadRequestException(`Product ${productId} not found!`),
    );
    return product;
  }

  private async saveWithEvents(product: ProductEntity) {
    const savedProduct = await this.repo.save(product);
    await this.eventsRepo.save(savedProduct.exportEvents());
    return savedProduct;
  }
}
