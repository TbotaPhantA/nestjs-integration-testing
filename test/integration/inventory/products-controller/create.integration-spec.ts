import { afterAll, describe } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { ProductController } from '../../../../src/inventory/product.controller.js';
import { ProductEventNameEnum } from '../../../../src/inventory/entities/productEvent.entity.js';
import { productsClient } from '../../../shared/clients/products.client.js';
import { createTestSuite } from '../../../shared/testing/test-suite.js';
import { expectInDB } from '../../../shared/testing/matchers.js';
import { ProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/productDto.builder.js';
import { ProductEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEntity.builder.js';
import { ProductEventEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEventEntity.builder.js';

const testApp = createTestSuite({ freezeDate: '2000-01-01T00:00:00.000Z' });

describe(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe(ProductController.prototype.create.name, () => {
    testApp.itTx(
      'creates a product and records a PRODUCT_WAS_CREATED event',
      async ({ app, txHost, now }) => {
        const requestBody = ProductDtoBuilder.defaultAll().result
        const response = await productsClient(app).create(requestBody);
        const id = response.body.id;

        expect(response.statusCode).toStrictEqual(HttpStatus.CREATED);
        expect(response.body).toMatchDto(
          ProductDtoBuilder.defaultAll().with({
            id,
          }).result
        );
        await expectInDB({ txHost, id }).toMatchEntity(
          ProductEntityBuilder.defaultAll().with({
            id,
          }).result,
        );
        await expectInDB({ txHost, aggregateId: id }).toMatchEvent(
          ProductEventEntityBuilder.defaultAll().with({
            eventName: ProductEventNameEnum.PRODUCT_WAS_CREATED,
            aggregateId: id,
            createdAt: now,
            value: response.body,
          }).result,
        );
      },
    );
  });
});
