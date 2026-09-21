import { afterAll, describe } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import { ProductController } from '../../../../src/inventory/product.controller.js';
import { ProductEntity } from '../../../../src/inventory/entities/product.entity.js';
import {
  ProductEventEntity,
  ProductEventNameEnum,
} from '../../../../src/inventory/entities/productEvent.entity.js';
import { productsClient } from '../../../shared/clients/products.client.js';
import {
  ProductFixtureNamesEnum,
  ProductFixtures,
} from '../../../shared/fixtures/inventory/products.fixtures.js';
import { createTestSuite } from '../../../shared/testing/test-suite.js';

const testApp = createTestSuite({ freezeDate: '2000-01-02T00:00:00.000Z' });

describe(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe(ProductController.prototype.reDescribe.name, () => {
    testApp.itTx(
      're-describes the seeded product and records a PRODUCT_WAS_RE_DESCRIBED event',
      async ({ app, txHost, now }) => {
        const fixture =
          ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];
        const changes = { name: 'name2', description: 'description2' };

        const requestBody = fixture.makeReDescribeDto().with(changes).result;
        const response = await productsClient(app).reDescribe(requestBody);

        expect(response).toMatchStatus(HttpStatus.OK);
        const expectedResponse = fixture.makeResponseDto()
          .with({ ...changes, updatedAt: now.toISOString() })
          .result
        expect(response.body).toMatchDto(expectedResponse);

        const product = await txHost.tx
          .getRepository(ProductEntity)
          .findOneOrFail({ where: { id: fixture.id } });
        const expectedEntity = fixture.makeEntity().with({ ...changes, updatedAt: now }).result
        expect(product).toMatchEntity(expectedEntity);

        const event = await txHost.tx
          .getRepository(ProductEventEntity)
          .findOneOrFail({ where: { aggregateId: fixture.id } });
        const expectedEvent = fixture
          .makeEvent(ProductEventNameEnum.PRODUCT_WAS_RE_DESCRIBED)
          .with({
            createdAt: now,
            value: response.body,
          }).result
        expect(event).toMatchEvent(expectedEvent);
      },
    );
  });
});
