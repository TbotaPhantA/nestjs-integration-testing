import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/createProduct.dto.js';
import { ProductRepository } from './product.repository.js';
import { ProductDto } from './dto/product.dto.js';
import { ProductEntity } from './db/product.entity.js';

@Injectable()
export class ProductService {
  constructor(
    private readonly repo: ProductRepository,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductDto> {
    const savedProduct = await this.repo.save(ProductEntity.createByDto(dto))
    return ProductDto.from(savedProduct)
  }
}
