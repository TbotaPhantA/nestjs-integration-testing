import { afterAll, describe } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { ProductController } from '../../../../src/inventory/product.controller.js';
import { productsClient } from '../../../shared/clients/products.client.js';
import {
  ProductFixtureNamesEnum,
  ProductFixtures,
} from '../../../shared/fixtures/inventory/products.fixtures.js';
import { createTestSuite } from '../../../shared/testing/test-suite.js';

const testApp = createTestSuite();

describe(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe(ProductController.prototype.findById.name, () => {
    it('returns the seeded product by id', async () => {
      const fixture = ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];
      const { app } = await testApp.context();

      const response = await productsClient(app).findById(fixture.id);

      expect(response).toRespondWith(HttpStatus.OK);
      expect(response.body).toMatchDto(fixture.dto().result);
    });
  });
});
