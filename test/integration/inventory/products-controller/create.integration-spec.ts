import { afterAll, describe } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { ProductController } from '../../../../src/inventory/product.controller.js';
import { ProductEventNameEnum } from '../../../../src/inventory/entities/productEvent.entity.js';
import { productsClient } from '../../../shared/clients/products.client.js';
import { createTestSuite } from '../../../shared/testing/test-suite.js';
import {
  expectProductEventInDB,
  expectProductInDB,
} from '../../../shared/testing/expectations.js';
import { ProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/productDto.builder.js';
import { ProductEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEntity.builder.js';
import { ProductEventEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEventEntity.builder.js';
import type { ProductResponseDto } from '../../../../src/inventory/dto/productResponseDto.js';

const testApp = createTestSuite({ freezeDate: '2000-01-01T00:00:00.000Z' });

describe(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe(ProductController.prototype.create.name, () => {
    testApp.itTx(
      'creates a product and records a PRODUCT_WAS_CREATED event',
      async ({ app, txHost, now }) => {
        const requestBody = ProductDtoBuilder.defaultAll().result;

        const { statusCode, body } = await productsClient(app).create(requestBody);

        const id = (body as ProductResponseDto).id;
        const expectedResponse = ProductDtoBuilder
          .defaultAll()
          .with({
            id,
          }).result;
        const expectedEntity = ProductEntityBuilder
          .defaultAll()
          .with({
            id,
          }).result;
        const expectedEvent = ProductEventEntityBuilder.defaultAll().with({
          eventName: ProductEventNameEnum.PRODUCT_WAS_CREATED,
          aggregateId: id,
          createdAt: now,
          value: body as ProductResponseDto,
        }).result


        expect(statusCode).toStrictEqual(HttpStatus.CREATED);
        expect(body).toStrictEqual(expectedResponse);
        await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
        await expectProductEventInDB({ txHost, aggregateId: id }).toStrictEqual(expectedEvent);
      },
    );
  });
});
