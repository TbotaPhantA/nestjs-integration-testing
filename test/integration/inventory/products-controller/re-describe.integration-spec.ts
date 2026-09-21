import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { ProductController } from '../../../../src/inventory/product.controller.js';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module.js';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { TransactionHost } from '@nestjs-cls/transactional';
import { isolateInTransaction } from '../../../shared/utils/isolateInTransaction.js';
import { hashInt8 } from '../../../shared/utils/hashes/hashInt8.js';
import {
  ProductEntityBuilder,
  ProductFixtureNamesEnum
} from '../../../shared/fixtures/builders/inventory/entities/productEntity.builder.js';
import {
  ReDescribeProductDtoBuilder
} from '../../../shared/fixtures/builders/inventory/dto/reDescribeProductDto.builder.js';
import { HttpStatus } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ProductDto } from '../../../../src/inventory/dto/product.dto.js';
import { ProductEntity } from '../../../../src/inventory/entities/product.entity.js';
import { ProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/productDto.builder.js';
import { ProductEventEntity, ProductEventNameEnum } from '../../../../src/inventory/entities/productEvent.entity.js';
import {
  ProductEventEntityBuilder
} from '../../../shared/fixtures/builders/inventory/entities/productEventEntity.builder.js';

describe(`${ProductController.name}`, () => {
  let app: NestFastifyApplication;
  let now: Date;
  let txHost: TransactionHost<TransactionalAdapterTypeOrm>;

  beforeAll(async () => {
    now = new Date('2000-01-02T00:00:00.000Z')
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

  describe(`${ProductController.prototype.reDescribe.name}`, () => {
    test('should successfully create new product and insert event', async () => {
      await isolateInTransaction(async () => {
        const id = hashInt8(ProductFixtureNamesEnum.DEFAULT_PRODUCT).toString();

        const { statusCode, body } = await app.inject({
          method: 'PATCH',
          url: `products/re-describe`,
          body: ReDescribeProductDtoBuilder.defaultAll.with({
            productId: id,
            name: 'name2',
            description: 'description2',
          }).result,
        });

        const response = plainToInstance(ProductDto, JSON.parse(body))

        expect(statusCode).toStrictEqual(HttpStatus.OK)
        const expectedResponse = ProductDtoBuilder['DEFAULT_PRODUCT'].with({
          name: 'name2',
          description: 'description2',
          updatedAt: now.toISOString(),
        }).result;
        expect(response).toStrictEqual(expectedResponse)

        const product = await txHost.tx.getRepository(ProductEntity)
          .findOne({ where: { id }});
        const expectedProduct = ProductEntityBuilder['DEFAULT_PRODUCT'].with({
          name: 'name2',
          description: 'description2',
          updatedAt: now,
        }).result;
        expect(product).toStrictEqual(expectedProduct);

        const productWasReDescribedEvent = await txHost.tx.getRepository(ProductEventEntity)
          .findOne({ where: { aggregateId: id } })
        const expectedProductEvent = ProductEventEntityBuilder.defaultAll
          .with({
            aggregateId: id,
            eventName: ProductEventNameEnum.PRODUCT_WAS_RE_DESCRIBED,
            createdAt: now,
            value: expectedResponse,
          })
          .omit('messageId')
          .result
        expect(productWasReDescribedEvent).toMatchObject(expectedProductEvent)

      }, txHost)
    });
  });
});
