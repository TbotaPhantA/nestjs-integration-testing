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
import { toResponse } from '../../../shared/utils/toResponse.js';

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

  describe(`${ProductController.prototype.findById.name}`, () => {
    test('should successfully find created product', async () => {
      const productId = hashInt8(ProductFixtureNamesEnum.CREATED_PRODUCT)

      const response = await app.inject({
        method: 'GET',
        url: `products/find-by-id/${productId}`
      })

      expect(response.statusCode).toStrictEqual(HttpStatus.OK)
      expect(JSON.parse(response.body)).toStrictEqual(toResponse(ProductDtoBuilder['CREATED_PRODUCT'].result))
    })
  });
});
