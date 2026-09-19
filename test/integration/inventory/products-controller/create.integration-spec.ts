import { ProductController } from '../../../../src/inventory/product.controller.js';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../../../../src/app.module.js';
import { Test } from '@nestjs/testing';
import { CreateProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/createProductDto.builder.js';
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
    test('should successfully create new product and insert event', async () => {
      const dto = CreateProductDtoBuilder.defaultAll().result

      const response = await app.inject({
        method: 'POST',
        url: 'products/create',
        body: dto,
      })

      expect(response.statusCode).toStrictEqual(HttpStatus.CREATED)
      expect(JSON.parse(response.body)).toStrictEqual(toResponse(ProductDtoBuilder['CREATED_PRODUCT']))

      // TODO: check record and event in db
    })
  });
});
