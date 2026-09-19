import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/createProduct.dto.js';
import { ProductRepository } from './repositories/product.repository.js';
import { ProductDto } from './dto/product.dto.js';
import { ProductEntity } from './entities/product.entity.js';
import { ProductEventRepository } from './repositories/productEvent.repository.js';
import { ReDescribeProductDto } from './dto/reDescribeProduct.dto.js';
import { ChangeQuantityDto } from './dto/changeQuantity.dto.js';
import { assertTruthy } from '../shared/utils/asrts/assertTruthy.js';
import { Propagation, Transactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ProductService {
  constructor(
    private readonly repo: ProductRepository,
    private readonly eventsRepo: ProductEventRepository,
  ) {}

  @Transactional<TransactionalAdapterTypeOrm>(Propagation.Nested)
  async findById(productId: number): Promise<ProductDto> {
    const product = await this.getById(productId)
    return ProductDto.from(product)
  }

  @Transactional<TransactionalAdapterTypeOrm>(Propagation.Nested)
  async create(dto: CreateProductDto): Promise<ProductDto> {
    const product = ProductEntity.createByDto(dto)
    const savedProduct = await this.saveWithEvents(product)
    return ProductDto.from(savedProduct)
  }

  @Transactional<TransactionalAdapterTypeOrm>(Propagation.Nested)
  async reDescribe(dto: ReDescribeProductDto): Promise<ProductDto> {
    const product = await this.getById(dto.productId)
    product.reDescribe(dto)
    const savedProduct = await this.saveWithEvents(product)
    return ProductDto.from(savedProduct)
  }

  @Transactional<TransactionalAdapterTypeOrm>(Propagation.Nested)
  async changeQuantity(dto: ChangeQuantityDto): Promise<ProductDto> {
    const product = await this.getById(dto.productId)
    product.changeQuantity(dto)
    const savedProduct = await this.saveWithEvents(product)
    return ProductDto.from(savedProduct)
  }

  @Transactional<TransactionalAdapterTypeOrm>(Propagation.Nested)
  async delete(productId: number): Promise<ProductDto> {
    const product = await this.getById(productId)
    product.markAsDeleted()
    const savedProduct = await this.saveWithEvents(product)
    return ProductDto.from(savedProduct)
  }

  private async getById(productId: number): Promise<ProductEntity> {
    const product = await this.repo.findById(productId)
    assertTruthy(product, new BadRequestException(`Product ${productId} not found!`))
    return product
  }

  private async saveWithEvents(product: ProductEntity) {
    const savedProduct = await this.repo.save(product)
    await this.eventsRepo.save(savedProduct.exportEvents())
    return savedProduct
  }
}
