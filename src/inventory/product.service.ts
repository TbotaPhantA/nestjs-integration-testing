import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/createProduct.dto.js';
import { ProductRepository } from './repositories/product.repository.js';
import { ProductDto } from './dto/product.dto.js';
import { ProductEntity } from './entities/product.entity.js';
import { ProductEventRepository } from './repositories/productEvent.repository.js';

@Injectable()
export class ProductService {
  constructor(
    private readonly repo: ProductRepository,
    private readonly eventsRepo: ProductEventRepository,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDto> {
    const product = ProductEntity.createByDto(dto)
    const savedProduct = await this.repo.save(product)
    await this.eventsRepo.save(savedProduct.exportEvents())
    return ProductDto.from(savedProduct)
  }
}
