import type { HttpStatus } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from '../../../src/inventory/dto/createProduct.dto.js';
import { ProductResponseDto } from '../../../src/inventory/dto/productResponseDto.js';
import { ReDescribeProductDto } from '../../../src/inventory/dto/reDescribeProduct.dto.js';
import { ChangeQuantityDto } from '../../../src/inventory/dto/changeQuantity.dto.js';

export interface TestResponse<T> {
  statusCode: HttpStatus;
  body: T;
}

export class ProductsClient {
  constructor(private readonly app: NestFastifyApplication) {}

  async create(dto: CreateProductDto): Promise<TestResponse<ProductResponseDto>> {
    return this.request('POST', 'products/create', dto);
  }

  async findById(id: string): Promise<TestResponse<ProductResponseDto>> {
    return this.request('GET', `products/find-by-id/${id}`);
  }

  async reDescribe(
    dto: ReDescribeProductDto,
  ): Promise<TestResponse<ProductResponseDto>> {
    return this.request('PATCH', 'products/re-describe', dto);
  }

  async delete(id: string): Promise<TestResponse<ProductResponseDto>> {
    return this.request('DELETE', `products/delete/${id}`)
  }

  async changeQuantity(
    dto: ChangeQuantityDto,
  ): Promise<TestResponse<ProductResponseDto>> {
    return this.request('PATCH', 'products/change-quantity', dto);
  }

  private async request(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    url: string,
    body?: object,
  ): Promise<TestResponse<ProductResponseDto>> {
    const { statusCode, body: rawBody } = await this.app.inject({
      method,
      url,
      body,
    });

    return {
      statusCode,
      body: plainToInstance(ProductResponseDto, JSON.parse(rawBody)),
    };
  }
}

export function productsClient(app: NestFastifyApplication): ProductsClient {
  return new ProductsClient(app);
}
