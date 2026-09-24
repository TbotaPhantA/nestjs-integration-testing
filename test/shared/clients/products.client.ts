import { expect } from 'vitest';
import type { HttpStatus } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from '../../../src/inventory/dto/createProduct.dto.js';
import { ProductResponseDto } from '../../../src/inventory/dto/productResponseDto.js';
import { ReDescribeProductDto } from '../../../src/inventory/dto/reDescribeProduct.dto.js';
import { ChangeQuantityDto } from '../../../src/inventory/dto/changeQuantity.dto.js';

export interface ErrorResponseBody {
  statusCode: HttpStatus;
  message: string;
  error: string;
}

export type ProductSuccessStatus = HttpStatus.OK | HttpStatus.CREATED;

export interface ProductSuccessResponse {
  statusCode: ProductSuccessStatus;
  body: ProductResponseDto;
}

export interface ProductErrorResponse {
  statusCode: Exclude<HttpStatus, ProductSuccessStatus>;
  body: ErrorResponseBody;
}

export type ProductResponse = ProductSuccessResponse | ProductErrorResponse;

export class ProductRequest<R extends ProductResponse> {
  constructor(private readonly promise: Promise<R>) {}

  expectStatus<T extends HttpStatus>(
    expected: T,
  ): Promise<R & { statusCode: T }> {
    return this.promise.then((response) => {
      expect(response.statusCode).toStrictEqual(expected);
      return response as R & { statusCode: T };
    });
  }
}

export class ProductsClient {
  constructor(private readonly app: NestFastifyApplication) {}

  create(dto: CreateProductDto): ProductRequest<ProductResponse> {
    return new ProductRequest(this.request('POST', 'products/create', dto));
  }

  findById(id: string): ProductRequest<ProductResponse> {
    return new ProductRequest(this.request('GET', `products/find-by-id/${id}`));
  }

  reDescribe(dto: ReDescribeProductDto): ProductRequest<ProductResponse> {
    return new ProductRequest(
      this.request('PATCH', 'products/re-describe', dto),
    );
  }

  delete(id: string): ProductRequest<ProductResponse> {
    return new ProductRequest(this.request('DELETE', `products/delete/${id}`));
  }

  changeQuantity(dto: ChangeQuantityDto): ProductRequest<ProductResponse> {
    return new ProductRequest(
      this.request('PATCH', 'products/change-quantity', dto),
    );
  }

  private async request(
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    url: string,
    body?: object,
  ): Promise<ProductResponse> {
    const { statusCode, body: rawBody } = await this.app.inject({
      method,
      url,
      body,
    });

    const parsedBody = JSON.parse(rawBody);

    if (statusCode >= 400) {
      return {
        statusCode,
        body: parsedBody as ErrorResponseBody,
      } as ProductErrorResponse;
    }

    return {
      statusCode,
      body: plainToInstance(ProductResponseDto, parsedBody),
    } as ProductSuccessResponse;
  }
}

export function productsClient(app: NestFastifyApplication): ProductsClient {
  return new ProductsClient(app);
}
