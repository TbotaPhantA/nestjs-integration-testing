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
import { ReDescribeProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/reDescribeProductDto.builder.js';
import { ProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/productDto.builder.js';
import { ProductEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEntity.builder.js';
import { ProductEventEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEventEntity.builder.js';
import { ProductEntity } from '../../../../src/inventory/entities/product.entity.js';
import { ErrorResponseBodyBuilder } from '../../../shared/fixtures/builders/inventory/dto/errorResponseBody.builder.js';

const testApp = createTestSuite({ freezeDate: '2000-01-02T00:00:00.000Z' });

describe(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe(ProductController.prototype.reDescribe.name, () => {
    testApp.itTx(
      'should successfully redescribe a product',
      async ({ app, txHost, now }) => {
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
        await expectProductEventInDB({ txHost, aggregateId: id }).toStrictEqual(
          expectedEvent,
        );
      },
    );

    describe('unhappy path', () => {
      testApp.itTx(
        'returns Bad Request when the product does not exist',
        async ({ app }) => {
          const productId =
            ProductFixtures[ProductFixtureNamesEnum.NON_EXISTENT_PRODUCT].id;
          const requestBody = ReDescribeProductDtoBuilder.defaultAll().with({
            productId,
          }).result;
          const expectedErrorBody = ErrorResponseBodyBuilder.defaultAll().with({
            statusCode: HttpStatus.BAD_REQUEST,
            message: `Product ${productId} not found!`,
          }).result;

          const { body } = await productsClient(app)
            .reDescribe(requestBody)
            .expectStatus(HttpStatus.BAD_REQUEST);
          expect(body).toStrictEqual(expectedErrorBody);
        },
      );
    });
  });
});
