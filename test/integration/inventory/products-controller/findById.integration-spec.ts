import { ProductController } from '../../../../src/inventory/product.controller.js';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../../../src/app.module.js';
import { Test } from '@nestjs/testing';
import { hashInt8 } from '../../../shared/utils/hashes/hashInt8.js';
import {
  ProductFixtureNamesEnum
} from '../../../shared/fixtures/builders/inventory/entities/productEntity.builder.js';
import { HttpStatus } from '@nestjs/common';
import { ProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/productDto.builder.js';
import { plainToInstance } from 'class-transformer';
import { ProductDto } from '../../../../src/inventory/dto/product.dto.js';
import { afterAll } from 'vitest';

describe(`${ProductController.name}`, () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  })

  afterAll(async () => {
    await app.close();
  });

  describe(`${ProductController.prototype.findById.name}`, () => {
    test('should successfully find created product', async () => {
      const productId = hashInt8(ProductFixtureNamesEnum.DEFAULT_PRODUCT)

      const { statusCode, body } = await app.inject({
        method: 'GET',
        url: `products/find-by-id/${productId}`
      })

      const response = plainToInstance(ProductDto, JSON.parse(body))

      expect(statusCode).toStrictEqual(HttpStatus.OK)
      expect(response).toStrictEqual(ProductDtoBuilder['DEFAULT_PRODUCT'].result)
    })
  });
});
