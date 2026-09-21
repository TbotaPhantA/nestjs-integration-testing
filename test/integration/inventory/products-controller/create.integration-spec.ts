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

const testApp = createTestSuite({ freezeDate: '2000-01-01T00:00:00.000Z' });

describe(ProductController.name, () => {
  afterAll(async () => {
    await testApp.teardown();
  });

  describe(ProductController.prototype.create.name, () => {
    testApp.itTx(
      'creates a product and records a PRODUCT_WAS_CREATED event',
      async ({ app, txHost, now }) => {
        const fixture =
          ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

        const response = await productsClient(app).create(
          fixture.createDto().result,
        );

        expect(response).toRespondWith(HttpStatus.CREATED);
        expect(response.body).toMatchDto(
          fixture.dto().with({ id: response.body.id }).result,
        );

        const product = await txHost.tx
          .getRepository(ProductEntity)
          .findOneOrFail({ where: { id: response.body.id } });
        expect(product).toMatchEntity(
          fixture.entity().with({ id: response.body.id }).result,
        );

        const event = await txHost.tx
          .getRepository(ProductEventEntity)
          .findOneOrFail({ where: { aggregateId: response.body.id } });
        expect(event).toMatchEvent(
          fixture.event().with({
            aggregateId: response.body.id,
            eventName: ProductEventNameEnum.PRODUCT_WAS_CREATED,
            createdAt: now,
            value: response.body,
          }).result,
        );
      },
    );
  });
});
