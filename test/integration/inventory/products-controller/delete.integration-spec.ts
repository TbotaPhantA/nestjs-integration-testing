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
import {
  ProductEventEntityBuilder
} from '../../../shared/fixtures/builders/inventory/entities/productEventEntity.builder.js';

const testApp = createTestSuite({ freezeDate: '2000-01-02T00:00:00.000Z' });

describe(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe(ProductController.prototype.reDescribe.name, () => {
    testApp.itTx(
      'should successfully delete a product',
      async ({ app, txHost, now }) => {
        const { id } = ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

        const expectedResponse = ProductDtoBuilder
          .defaultAll()
          .with({
            id,
            updatedAt: now.toISOString(),
            removedAt: now.toISOString(),
          }).result;
        const expectedEntity = ProductEntityBuilder.defaultAll()
          .with({
            id,
            updatedAt: now,
            removedAt: now,
          }).result;
        const expectedEvent = ProductEventEntityBuilder.defaultAll()
          .with({
            aggregateId: id,
            eventName: ProductEventNameEnum.PRODUCT_WAS_DELETED,
            createdAt: now,
            value: expectedResponse,
          }).result;

        const { statusCode, body } = await productsClient(app).delete(id);

        expect(statusCode).toStrictEqual(HttpStatus.OK);
        expect(body).toStrictEqual(expectedResponse);
        await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
        await expectProductEventInDB({ txHost, aggregateId: id }).toStrictEqual(expectedEvent);
      },
    );
  });
});
