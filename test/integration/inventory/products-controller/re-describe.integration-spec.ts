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
import {
  ReDescribeProductDtoBuilder
} from '../../../shared/fixtures/builders/inventory/dto/reDescribeProductDto.builder.js';
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
      're-describes %s and records a PRODUCT_WAS_RE_DESCRIBED event',
      async ({ app, txHost, now }) => {
        const { id } = ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];
        const changes = { name: 'name2', description: 'description2' };

        const requestBody = ReDescribeProductDtoBuilder
          .defaultAll()
          .with({ productId: id, ...changes })
          .result
        const { statusCode, body } = await productsClient(app).reDescribe(requestBody);

        expect(statusCode).toStrictEqual(HttpStatus.OK);
        expect(body).toStrictEqual(
          ProductDtoBuilder.defaultAll()
            .with({ id, ...changes, updatedAt: now.toISOString() }).result,
        );
        await expectProductInDB({ txHost, id }).toStrictEqual(
          ProductEntityBuilder.defaultAll().with({ id, ...changes, updatedAt: now }).result,
        );
        await expectProductEventInDB({
          txHost,
          aggregateId: id,
        }).toStrictEqual(
          ProductEventEntityBuilder.defaultAll()
            .with({
              aggregateId: id,
              eventName: ProductEventNameEnum.PRODUCT_WAS_RE_DESCRIBED,
              createdAt: now,
              value: body,
            }).result,
        );
      },
    );
  });
});
