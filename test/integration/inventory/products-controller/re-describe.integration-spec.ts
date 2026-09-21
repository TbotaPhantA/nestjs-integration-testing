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

const testApp = createTestSuite({ freezeDate: '2000-01-02T00:00:00.000Z' });

describe(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe(ProductController.prototype.reDescribe.name, () => {
    testApp.itTx(
      're-describes %s and records a PRODUCT_WAS_RE_DESCRIBED event',
      async ({ app, txHost, now }) => {
        const fixture =
          ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];
        const changes = { name: 'name2', description: 'description2' };

        const requestBody = fixture.makeReDescribeDto().with(changes).result;
        const response = await productsClient(app).reDescribe(requestBody);

        expect(response.statusCode).toStrictEqual(HttpStatus.OK);
        expect(response.body).toEqual(
          fixture
            .makeResponseDto()
            .with({ ...changes, updatedAt: now.toISOString() }).result,
        );
        await expectProductInDB({ txHost, id: fixture.id }).toStrictEqual(
          fixture.makeEntity().with({ ...changes, updatedAt: now }).result,
        );
        await expectProductEventInDB({
          txHost,
          aggregateId: fixture.id,
        }).toStrictEqual(
          fixture
            .makeEvent(ProductEventNameEnum.PRODUCT_WAS_RE_DESCRIBED)
            .with({
              createdAt: now,
              value: response.body,
            }).result,
        );
      },
    );
  });
});
