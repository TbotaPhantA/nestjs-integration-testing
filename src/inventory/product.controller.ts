import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProductService } from './product.service.js';
import { CreateProductDto } from './dto/createProduct.dto.js';
import { ProductResponseDto } from './dto/productResponseDto.js';
import { ReDescribeProductDto } from './dto/reDescribeProduct.dto.js';
import { ChangeQuantityDto } from './dto/changeQuantity.dto.js';
import { ProductIdParamDto } from './dto/productIdParamDto.js';

@Controller('products')
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get('find-by-id/:productId')
  async findById(
    @Param() { productId }: ProductIdParamDto,
  ): Promise<ProductResponseDto> {
    return this.service.findById(productId);
  }

  @Post('create')
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.service.create(dto);
  }

  @Patch('re-describe')
  async reDescribe(
    @Body() dto: ReDescribeProductDto,
  ): Promise<ProductResponseDto> {
    return this.service.reDescribe(dto);
  }

  @Patch('change-quantity')
  async changeQuantity(
    @Body() dto: ChangeQuantityDto,
  ): Promise<ProductResponseDto> {
    return this.service.changeQuantity(dto);
  }

  @Delete('delete/:productId')
  async delete(
    @Param() { productId }: ProductIdParamDto,
  ): Promise<ProductResponseDto> {
    return this.service.delete(productId);
  }
}
