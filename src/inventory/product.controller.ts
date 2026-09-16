import { Body, Controller, Post } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { CreateProductDto } from './dto/createProduct.dto.js';
import { ProductDto } from './dto/product.dto.js';

@Controller('products')
export class ProductController {
  constructor(
    private readonly service: ProductService,
  ) {}

  @Post('create')
  async create(@Body() dto: CreateProductDto): Promise<ProductDto> {
    return this.service.create(dto)
  }
}
