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
import { expectInDB } from '../../../shared/testing/matchers.js';

const testApp = createTestSuite({ freezeDate: '2000-01-02T00:00:00.000Z' });

describe(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe(ProductController.prototype.reDescribe.name, () => {
    testApp.itTx.each([
      [
        ProductFixtureNamesEnum.DEFAULT_PRODUCT,
        { name: 'name2', description: 'description2' },
      ],
    ])(
      're-describes %s and records a PRODUCT_WAS_RE_DESCRIBED event',
      async ({ app, txHost, now }, fixtureName, changes) => {
        const fixture = ProductFixtures[fixtureName];

        const requestBody = fixture.makeReDescribeDto().with(changes).result;
        const response = await productsClient(app).reDescribe(requestBody);

        expect(response).toMatchStatus(HttpStatus.OK);
        const expectedResponse = fixture
          .makeResponseDto()
          .with({ ...changes, updatedAt: now.toISOString() }).result;
        expect(response.body).toMatchDto(expectedResponse);

        const expectedEntity = fixture
          .makeEntity()
          .with({ ...changes, updatedAt: now }).result;
        await expectInDB({ txHost, id: fixture.id }).toMatchEntity(
          expectedEntity,
        );

        const expectedEvent = fixture
          .makeEvent(ProductEventNameEnum.PRODUCT_WAS_RE_DESCRIBED)
          .with({
            createdAt: now,
            value: response.body,
          }).result;
        await expectInDB({ txHost, aggregateId: fixture.id }).toMatchEvent(
          expectedEvent,
        );
      },
    );
  });
});
