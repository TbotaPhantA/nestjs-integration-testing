import type { HttpStatus } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from '../../../src/inventory/dto/createProduct.dto.js';
import { ProductDto } from '../../../src/inventory/dto/product.dto.js';
import { ReDescribeProductDto } from '../../../src/inventory/dto/reDescribeProduct.dto.js';

export interface TestResponse<T> {
  statusCode: HttpStatus;
  body: T;
}

export class ProductsClient {
  constructor(private readonly app: NestFastifyApplication) {}

  async create(dto: CreateProductDto): Promise<TestResponse<ProductDto>> {
    return this.request('POST', 'products/create', dto);
  }

  async findById(id: string): Promise<TestResponse<ProductDto>> {
    return this.request('GET', `products/find-by-id/${id}`);
  }

  async reDescribe(
    dto: ReDescribeProductDto,
  ): Promise<TestResponse<ProductDto>> {
    return this.request('PATCH', 'products/re-describe', dto);
  }

  private async request(
    method: 'GET' | 'POST' | 'PATCH',
    url: string,
    body?: object,
  ): Promise<TestResponse<ProductDto>> {
    const { statusCode, body: rawBody } = await this.app.inject({
      method,
      url,
      body,
    });

    return {
      statusCode,
      body: plainToInstance(ProductDto, JSON.parse(rawBody)),
    };
  }
}

export function productsClient(app: NestFastifyApplication): ProductsClient {
  return new ProductsClient(app);
}
