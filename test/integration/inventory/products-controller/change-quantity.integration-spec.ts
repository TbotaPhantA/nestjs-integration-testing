import { afterAll, describe } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { ProductController } from '../../../../src/inventory/product.controller.js';
import { ProductEventNameEnum } from '../../../../src/inventory/entities/productEvent.entity.js';
import { productsClient } from '../../../shared/clients/products.client.js';
import {
  ProductFixtureNamesEnum,
  ProductFixtures,
} from '../../../shared/fixtures/inventory/products.fixtures.js';
import { createTestSuite } from '../../../shared/testing/test-suite.js';
import {
  expectProductEventInDB,
  expectProductInDB,
} from '../../../shared/testing/expectations.js';
import { ProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/productDto.builder.js';
import { ProductEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEntity.builder.js';
import { ProductEventEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEventEntity.builder.js';
import { ProductEntity } from '../../../../src/inventory/entities/product.entity.js';
import { ChangeQuantityDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/changeQuantityDto.builder.js';
import { ErrorResponseBodyBuilder } from '../../../shared/fixtures/builders/inventory/dto/errorResponseBody.builder.js';

const testApp = createTestSuite({
  freezeDate: '2000-01-02T00:00:00.000Z',
  poolSize: 3,
});

describe.concurrent(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe.concurrent(ProductController.prototype.changeQuantity.name, () => {
    testApp.itTx('should not change quantity', async ({ app, txHost }) => {
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
      await expectProductEventInDB({ txHost, aggregateId: id }).toStrictEqual(
        expectedEvent,
      );
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

    testApp.itTx.each(testCases)(
      '%s',
      async ({ app, txHost, now }, { changes, expectedEventName }) => {
        const { id } = ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

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
        await expectProductEventInDB({ txHost, aggregateId: id }).toStrictEqual(
          expectedEvent,
        );
      },
    );
  });

  describe.concurrent('unhappy path', () => {
    testApp.itTx(
      'returns Bad Request when the product does not exist',
      async ({ app }) => {
        const nonExistentProductId = '9999889999';
        const requestBody = ChangeQuantityDtoBuilder.defaultAll().with({
          productId: nonExistentProductId,
        }).result;
        const expectedErrorBody = ErrorResponseBodyBuilder.defaultAll().with({
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Product ${nonExistentProductId} not found!`,
        }).result;

        const { body } = await productsClient(app)
          .changeQuantity(requestBody)
          .expectStatus(HttpStatus.BAD_REQUEST);
        expect(body).toStrictEqual(expectedErrorBody);
      },
    );
  });
});
