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

export interface ErrorResponseBody {
  statusCode: HttpStatus;
  message: string;
  error: string;
}

type TestResponseBody = ProductResponseDto | ErrorResponseBody;

export class ProductsClient {
  constructor(private readonly app: NestFastifyApplication) {}

  async create(dto: CreateProductDto): Promise<TestResponse<TestResponseBody>> {
    return this.request('POST', 'products/create', dto);
  }

  async findById(id: string): Promise<TestResponse<TestResponseBody>> {
    return this.request('GET', `products/find-by-id/${id}`);
  }

  async reDescribe(
    dto: ReDescribeProductDto,
  ): Promise<TestResponse<TestResponseBody>> {
    return this.request('PATCH', 'products/re-describe', dto);
  }

  async delete(id: string): Promise<TestResponse<TestResponseBody>> {
    return this.request('DELETE', `products/delete/${id}`)
  }

  async changeQuantity(
    dto: ChangeQuantityDto,
  ): Promise<TestResponse<TestResponseBody>> {
    return this.request('PATCH', 'products/change-quantity', dto);
  }

  private async request(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    url: string,
    body?: object,
  ): Promise<TestResponse<TestResponseBody>> {
    const { statusCode, body: rawBody } = await this.app.inject({
      method,
      url,
      body,
    });

    const parsedBody: TestResponseBody = JSON.parse(rawBody);

    if (statusCode >= 400) {
      return {
        statusCode,
        body: parsedBody as ErrorResponseBody,
      };
    }

    return {
      statusCode,
      body: plainToInstance(ProductResponseDto, parsedBody),
    };
  }
}

export function productsClient(app: NestFastifyApplication): ProductsClient {
  return new ProductsClient(app);
}
