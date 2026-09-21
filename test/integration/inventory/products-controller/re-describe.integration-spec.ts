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

        const response = await productsClient(app).reDescribe(
          fixture.reDescribeDto().with(changes).result,
        );

        expect(response).toRespondWith(HttpStatus.OK);
        expect(response.body).toMatchDto(
          fixture.dto().with({ ...changes, updatedAt: now.toISOString() })
            .result,
        );

        const product = await txHost.tx
          .getRepository(ProductEntity)
          .findOneOrFail({ where: { id: fixture.id } });
        expect(product).toMatchEntity(
          fixture.entity().with({ ...changes, updatedAt: now }).result,
        );

        const event = await txHost.tx
          .getRepository(ProductEventEntity)
          .findOneOrFail({ where: { aggregateId: fixture.id } });
        expect(event).toMatchEvent(
          fixture.event().with({
            eventName: ProductEventNameEnum.PRODUCT_WAS_RE_DESCRIBED,
            createdAt: now,
            value: response.body,
          }).result,
        );
      },
    );
  });
});
