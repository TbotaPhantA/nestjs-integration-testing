import { afterAll, beforeAll, describe, it } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ProductController } from '../../../../src/inventory/product.controller.js';
import { ProductEventNameEnum } from '../../../../src/inventory/entities/productEvent.entity.js';
import { ProductEntity } from '../../../../src/inventory/entities/product.entity.js';
import { productsClient } from '../../../shared/clients/products.client.js';
import {
  ProductFixtureNamesEnum,
  ProductFixtures,
} from '../../../shared/fixtures/inventory/products.fixtures.js';
import { createTestSuite } from '../../../shared/testing/test-suite.js';
import { isolateInTransaction } from '../../../shared/utils/isolateInTransaction.js';
import {
  expectProductEventInDB,
  expectProductInDB,
} from '../../../shared/testing/expectations.js';
import { ProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/productDto.builder.js';
import { ProductEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEntity.builder.js';
import { ProductEventEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEventEntity.builder.js';
import { ReDescribeProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/reDescribeProductDto.builder.js';
import { ChangeQuantityDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/changeQuantityDto.builder.js';
import { ErrorResponseBodyBuilder } from '../../../shared/fixtures/builders/inventory/dto/errorResponseBody.builder.js';

const testApp = createTestSuite({
  freezeDate: '2000-01-02T00:00:00.000Z',
  poolSize: 10,
});

let app: NestFastifyApplication;
let txHost: TransactionHost<TransactionalAdapterTypeOrm>;
let now: Date;

describe.concurrent(ProductController.name, () => {
  beforeAll(async () => {
    ({ app, txHost, now } = await testApp.context());
  });

  afterAll(async () => {
    await testApp.teardown();
  });

  describe.concurrent(ProductController.prototype.findById.name, () => {
    it.concurrent('returns the seeded product by id', async () => {
      const { id } = ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];
      const expectedResponse = ProductDtoBuilder.defaultAll().with({
        id,
      }).result;

      const { body } = await productsClient(app)
        .findById(id)
        .expectStatus(HttpStatus.OK);
      expect(body).toEqual(expectedResponse);
    });

    describe.concurrent('unhappy path', () => {
      it.concurrent(
        'returns Bad Request when the product does not exist',
        async () => {
          const nonExistentProductId = '9999889999';
          const expectedErrorBody = ErrorResponseBodyBuilder.defaultAll().with({
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Product ${nonExistentProductId} not found!`,
          }).result;

          const { body } = await productsClient(app)
            .findById(nonExistentProductId)
            .expectStatus(HttpStatus.BAD_REQUEST);
          expect(body).toStrictEqual(expectedErrorBody);
        },
      );
    });
  });

  describe.concurrent(ProductController.prototype.reDescribe.name, () => {
    it.concurrent('should successfully redescribe a product', async () => {
      await isolateInTransaction(async () => {
        const { id } = ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];
        const changes = {
          name: 'name2',
          description: 'description2',
        } satisfies Partial<ProductEntity>;
        const requestBody = ReDescribeProductDtoBuilder.defaultAll().with({
          ...changes,
          productId: id,
        }).result;
        const expectedResponse = ProductDtoBuilder.defaultAll().with({
          ...changes,
          id,
          updatedAt: now.toISOString(),
        }).result;
        const expectedEntity = ProductEntityBuilder.defaultAll().with({
          ...changes,
          id,
          updatedAt: now,
        }).result;
        const expectedEvent = ProductEventEntityBuilder.defaultAll().with({
          aggregateId: id,
          eventName: ProductEventNameEnum.PRODUCT_WAS_RE_DESCRIBED,
          createdAt: now,
          value: expectedResponse,
        }).result;

        const { body } = await productsClient(app)
          .reDescribe(requestBody)
          .expectStatus(HttpStatus.OK);

        expect(body).toStrictEqual(expectedResponse);
        await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
        await expectProductEventInDB({
          txHost,
          aggregateId: id,
        }).toStrictEqual(expectedEvent);
      }, txHost);
    });

    describe.concurrent('unhappy path', () => {
      it.concurrent(
        'returns Bad Request when the product does not exist',
        async () => {
          await isolateInTransaction(async () => {
            const nonExistentProductId = '9999889999';
            const requestBody = ReDescribeProductDtoBuilder.defaultAll().with({
              productId: nonExistentProductId,
            }).result;
            const expectedErrorBody =
              ErrorResponseBodyBuilder.defaultAll().with({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Product ${nonExistentProductId} not found!`,
              }).result;

            const { body } = await productsClient(app)
              .reDescribe(requestBody)
              .expectStatus(HttpStatus.BAD_REQUEST);
            expect(body).toStrictEqual(expectedErrorBody);
          }, txHost);
        },
      );
    });
  });

  describe.concurrent(ProductController.prototype.changeQuantity.name, () => {
    it.concurrent('should not change quantity', async () => {
      await isolateInTransaction(async () => {
        const { id } = ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

        const requestBody = ChangeQuantityDtoBuilder.defaultAll().with({
          quantity: 5, // same quantity as in fixture
          productId: id,
        }).result;
        const expectedResponse = ProductDtoBuilder.defaultAll().with({
          id,
        }).result;
        const expectedEntity = ProductEntityBuilder.defaultAll().with({
          id,
        }).result;
        const expectedEvent = null;

        const { body } = await productsClient(app)
          .changeQuantity(requestBody)
          .expectStatus(HttpStatus.OK);

        expect(body).toStrictEqual(expectedResponse);
        await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
        await expectProductEventInDB({
          txHost,
          aggregateId: id,
        }).toStrictEqual(expectedEvent);
      }, txHost);
    });

    const testCases = [
      {
        toString: () => '1 should successfully increase the quantity',
        changes: { quantity: 100 } satisfies Partial<ProductEntity>,
        expectedEventName: ProductEventNameEnum.PRODUCT_QUANTITY_WAS_INCREASED,
      },
      {
        toString: () => '2 should successfully reduce the quantity',
        changes: { quantity: 1 } satisfies Partial<ProductEntity>,
        expectedEventName: ProductEventNameEnum.PRODUCT_QUANTITY_WAS_REDUCED,
      },
    ];

    it.concurrent.each(testCases)(
      '%s',
      async ({ changes, expectedEventName }) => {
        await isolateInTransaction(async () => {
          const { id } =
            ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

          const requestBody = ChangeQuantityDtoBuilder.defaultAll().with({
            ...changes,
            productId: id,
          }).result;
          const expectedResponse = ProductDtoBuilder.defaultAll().with({
            ...changes,
            id,
            updatedAt: now.toISOString(),
          }).result;
          const expectedEntity = ProductEntityBuilder.defaultAll().with({
            ...changes,
            id,
            updatedAt: now,
          }).result;
          const expectedEvent = ProductEventEntityBuilder.defaultAll().with({
            aggregateId: id,
            eventName: expectedEventName,
            createdAt: now,
            value: expectedResponse,
          }).result;

          const { body } = await productsClient(app)
            .changeQuantity(requestBody)
            .expectStatus(HttpStatus.OK);

          expect(body).toStrictEqual(expectedResponse);
          await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
          await expectProductEventInDB({
            txHost,
            aggregateId: id,
          }).toStrictEqual(expectedEvent);
        }, txHost);
      },
    );

    describe.concurrent('unhappy path', () => {
      it.concurrent(
        'returns Bad Request when the product does not exist',
        async () => {
          await isolateInTransaction(async () => {
            const nonExistentProductId = '9999889999';
            const requestBody = ChangeQuantityDtoBuilder.defaultAll().with({
              productId: nonExistentProductId,
            }).result;
            const expectedErrorBody =
              ErrorResponseBodyBuilder.defaultAll().with({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Product ${nonExistentProductId} not found!`,
              }).result;

            const { body } = await productsClient(app)
              .changeQuantity(requestBody)
              .expectStatus(HttpStatus.BAD_REQUEST);
            expect(body).toStrictEqual(expectedErrorBody);
          }, txHost);
        },
      );
    });
  });

  describe.concurrent(ProductController.prototype.delete.name, () => {
    it.concurrent('should successfully delete a product', async () => {
      await isolateInTransaction(async () => {
        const { id } = ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

        const expectedResponse = ProductDtoBuilder.defaultAll().with({
          id,
          updatedAt: now.toISOString(),
          removedAt: now.toISOString(),
        }).result;
        const expectedEntity = ProductEntityBuilder.defaultAll().with({
          id,
          updatedAt: now,
          removedAt: now,
        }).result;
        const expectedEvent = ProductEventEntityBuilder.defaultAll().with({
          aggregateId: id,
          eventName: ProductEventNameEnum.PRODUCT_WAS_DELETED,
          createdAt: now,
          value: expectedResponse,
        }).result;

        const { body } = await productsClient(app)
          .delete(id)
          .expectStatus(HttpStatus.OK);

        expect(body).toStrictEqual(expectedResponse);
        await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
        await expectProductEventInDB({
          txHost,
          aggregateId: id,
        }).toStrictEqual(expectedEvent);
      }, txHost);
    });

    describe.concurrent('unhappy path', () => {
      it.concurrent(
        'returns Bad Request when the product does not exist',
        async () => {
          await isolateInTransaction(async () => {
            const nonExistentProductId = '9999889999';
            const expectedErrorBody =
              ErrorResponseBodyBuilder.defaultAll().with({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Product ${nonExistentProductId} not found!`,
              }).result;

            const { body } = await productsClient(app)
              .delete(nonExistentProductId)
              .expectStatus(HttpStatus.BAD_REQUEST);
            expect(body).toStrictEqual(expectedErrorBody);
          }, txHost);
        },
      );
    });
  });
});
