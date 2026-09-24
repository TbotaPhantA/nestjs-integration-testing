import { afterAll, describe } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { ProductController } from '../../../../src/inventory/product.controller.js';
import { productsClient } from '../../../shared/clients/products.client.js';
import {
  ProductFixtureNamesEnum,
  ProductFixtures,
} from '../../../shared/fixtures/inventory/products.fixtures.js';
import { createTestSuite } from '../../../shared/testing/test-suite.js';
import { ProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/productDto.builder.js';
import { ErrorResponseBodyBuilder } from '../../../shared/fixtures/builders/inventory/dto/errorResponseBody.builder.js';

const testApp = createTestSuite();

describe(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe(ProductController.prototype.findById.name, () => {
    it('returns the seeded product by id', async () => {
      const { id } = ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];
      const { app } = await testApp.context();
      const expectedResponse = ProductDtoBuilder.defaultAll().with({
        id,
      }).result;

      const { body } = await productsClient(app)
        .findById(id)
        .expectStatus(HttpStatus.OK);
      expect(body).toEqual(expectedResponse);
    });

    describe('unhappy path', () => {
      testApp.itTx(
        'returns Bad Request when the product does not exist',
        async ({ app }) => {
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
});
