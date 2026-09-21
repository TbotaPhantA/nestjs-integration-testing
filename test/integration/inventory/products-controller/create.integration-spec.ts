import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { ProductController } from '../../../../src/inventory/product.controller.js';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module.js';
import { CreateProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/createProductDto.builder.js';
import { plainToInstance } from 'class-transformer';
import { ProductDto } from '../../../../src/inventory/dto/product.dto.js';
import { HttpStatus } from '@nestjs/common';
import { ProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/productDto.builder.js';
import { ProductEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEntity.builder.js';
import { ProductEntity } from '../../../../src/inventory/entities/product.entity.js';
import { ProductEventEntity, ProductEventNameEnum } from '../../../../src/inventory/entities/productEvent.entity.js';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import {
  ProductEventEntityBuilder
} from '../../../shared/fixtures/builders/inventory/entities/productEventEntity.builder.js';
import { isolateInTransaction } from '../../../shared/utils/isolateInTransaction.js';

describe(`${ProductController.name}`, () => {
  let app: NestFastifyApplication;
  let now: Date;
  let txHost: TransactionHost<TransactionalAdapterTypeOrm>;

  beforeAll(async () => {
    now = new Date('2000-01-01T00:00:00.000Z')
    vi.useFakeTimers({
      toFake: ['Date']
    });
    vi.setSystemTime(now);

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    txHost = app.get(TransactionHost<TransactionalAdapterTypeOrm>)
  });

  afterAll(async () => {
    await app.close();
    vi.useRealTimers();
  });

  describe(`${ProductController.prototype.findById.name}`, () => {
    test('should successfully create new product and insert event', async () => {
      await isolateInTransaction(async () => {
        console.log('before request:', txHost.isTransactionActive());
        const dto = CreateProductDtoBuilder.defaultAll().result;

        const { statusCode, body } = await app.inject({
          method: 'POST',
          url: 'products/create',
          body: dto,
        });

        const response = plainToInstance(ProductDto, JSON.parse(body));
        const { id } = response
        const expectedResponse = ProductDtoBuilder['DEFAULT_PRODUCT'].with({ id }).result
        expect(statusCode).toStrictEqual(HttpStatus.CREATED);
        expect(response).toStrictEqual(expectedResponse);


        const product = await txHost.tx.getRepository(ProductEntity).findOne({ where: { id } })
        const expectedProduct = ProductEntityBuilder['DEFAULT_PRODUCT'].with({ id }).result
        expect(product).toStrictEqual(expectedProduct)

        const productWasCreatedEvent = await txHost.tx.getRepository(ProductEventEntity).findOne({ where: { aggregateId: id }})
        const expectedEvent = ProductEventEntityBuilder.defaultAll.with({
          aggregateId: id,
          createdAt: now,
          eventName: ProductEventNameEnum.PRODUCT_WAS_CREATED,
          value: expectedResponse,
        }).omit('messageId').result
        expect(productWasCreatedEvent).toMatchObject(expectedEvent)
      }, txHost)
    });
  });
});
