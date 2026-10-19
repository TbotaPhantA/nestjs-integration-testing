import { afterAll, beforeAll, describe, it } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { TransactionHost } from '@nestjs-cls/transactional';
import type { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ProductController } from '../../../../src/inventory/product.controller.js';
import { ProductEventNameEnum } from '../../../../src/inventory/entities/productEvent.entity.js';
import type { ProductEntity } from '../../../../src/inventory/entities/product.entity.js';
import { productsClient } from '../../../shared/clients/products.client.js';
import {
  ProductFixtureNamesEnum,
  ProductFixtures,
} from '../../../shared/fixtures/inventory/products.fixtures.js';
import { createTestSuite } from '../../../shared/testing/test-suite.js';
import { isolateInTransaction } from '../../../shared/utils/isolateInTransaction.js';
import {
  expectProductEventInDB,
  expectProductInDB,
} from '../../../shared/testing/expectations.js';
import { ProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/productDto.builder.js';
import { ProductEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEntity.builder.js';
import { ProductEventEntityBuilder } from '../../../shared/fixtures/builders/inventory/entities/productEventEntity.builder.js';
import { CreateProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/createProductDto.builder.js';
import { ReDescribeProductDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/reDescribeProductDto.builder.js';
import { ChangeQuantityDtoBuilder } from '../../../shared/fixtures/builders/inventory/dto/changeQuantityDto.builder.js';

const testApp = createTestSuite({
  freezeDate: '2000-01-02T00:00:00.000Z',
  poolSize: 30,
});

const CASE_TIMEOUT = 30_000;
const HOOK_TIMEOUT = 60_000;

const CREATE_CASES = 250;
const RE_DESCRIBE_CASES = 200;
const INCREASE_CASES = 250;
const REDUCE_CASES = 250;
const NO_OP_CASES = 100;
const DELETE_CASES = 100;
const FIND_BY_ID_CASES = 100;

const indices = (count: number) => Array.from({ length: count }, (_, i) => i);

const createCases = indices(CREATE_CASES).map((i) => {
  const name = `product-${i}`;
  const description = `description-${i}`;
  const quantity = 6 + (i % 250);

  return {
    toString: () => `create #${i} (name=${name}, quantity=${quantity})`,
    name,
    description,
    quantity,
  };
});

const reDescribeCases = indices(RE_DESCRIBE_CASES).map((i) => {
  const name = `re-described-name-${i}`;
  const description = `re-described-description-${i}`;

  return {
    toString: () => `reDescribe #${i} (name=${name})`,
    changes: { name, description } satisfies Partial<ProductEntity>,
  };
});

const increaseCases = indices(INCREASE_CASES).map((i) => {
  const quantity = 6 + i;

  return {
    toString: () => `increase #${i} (quantity=${quantity})`,
    changes: { quantity } satisfies Partial<ProductEntity>,
    expectedEventName: ProductEventNameEnum.PRODUCT_QUANTITY_WAS_INCREASED,
  };
});

const reduceCases = indices(REDUCE_CASES).map((i) => {
  const quantity = 1 + (i % 4);

  return {
    toString: () => `reduce #${i} (quantity=${quantity})`,
    changes: { quantity } satisfies Partial<ProductEntity>,
    expectedEventName: ProductEventNameEnum.PRODUCT_QUANTITY_WAS_REDUCED,
  };
});

const noOpCases = indices(NO_OP_CASES).map((i) => {
  const quantity = 5;

  return {
    toString: () => `no-op #${i} (quantity=${quantity})`,
    changes: { quantity } satisfies Partial<ProductEntity>,
  };
});

const deleteCases = indices(DELETE_CASES).map((i) => ({
  toString: () => `delete #${i}`,
}));

const findByIdCases = indices(FIND_BY_ID_CASES).map((i) => ({
  toString: () => `findById #${i}`,
}));

let app: NestFastifyApplication;
let txHost: TransactionHost<TransactionalAdapterTypeOrm>;
let now: Date;

describe.skip.concurrent(ProductController.name, () => {
  beforeAll(async () => {
    ({ app, txHost, now } = await testApp.context());
  }, HOOK_TIMEOUT);

  afterAll(async () => {
    await testApp.teardown();
  }, HOOK_TIMEOUT);

  describe.concurrent(ProductController.prototype.findById.name, () => {
    it.concurrent.each(findByIdCases)(
      '%s',
      { timeout: CASE_TIMEOUT },
      async () => {
        const { id } = ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];
        const expectedResponse = ProductDtoBuilder.defaultAll().with({
          id,
        }).result;

        const { body } = await productsClient(app)
          .findById(id)
          .expectStatus(HttpStatus.OK);
        expect(body).toEqual(expectedResponse);
      },
    );
  });

  describe.concurrent(ProductController.prototype.create.name, () => {
    it.concurrent.each(createCases)(
      '%s',
      { timeout: CASE_TIMEOUT },
      async ({ name, description, quantity }) => {
        await isolateInTransaction(async () => {
          const requestBody = CreateProductDtoBuilder.defaultAll().with({
            name,
            description,
            quantity,
          }).result;

          const { body } = await productsClient(app)
            .create(requestBody)
            .expectStatus(HttpStatus.CREATED);

          const id = body.id;
          const expectedResponse = ProductDtoBuilder.defaultAll().with({
            id,
            name,
            description,
            quantity,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          }).result;
          const expectedEntity = ProductEntityBuilder.defaultAll().with({
            id,
            name,
            description,
            quantity,
            createdAt: now,
            updatedAt: now,
          }).result;
          const expectedEvent = ProductEventEntityBuilder.defaultAll().with({
            eventName: ProductEventNameEnum.PRODUCT_WAS_CREATED,
            aggregateId: id,
            createdAt: now,
            value: expectedResponse,
          }).result;

          expect(body).toStrictEqual(expectedResponse);
          await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
          await expectProductEventInDB({
            txHost,
            aggregateId: id,
          }).toStrictEqual(expectedEvent);
        }, txHost);
      },
    );
  });

  describe.concurrent(ProductController.prototype.reDescribe.name, () => {
    it.concurrent.each(reDescribeCases)(
      '%s',
      { timeout: CASE_TIMEOUT },
      async ({ changes }) => {
        await isolateInTransaction(async () => {
          const { id } =
            ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

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
          await expectProductEventInDB({
            txHost,
            aggregateId: id,
          }).toStrictEqual(expectedEvent);
        }, txHost);
      },
    );
  });

  describe.concurrent(ProductController.prototype.changeQuantity.name, () => {
    it.concurrent.each(increaseCases)(
      '%s',
      { timeout: CASE_TIMEOUT },
      async ({ changes, expectedEventName }) => {
        await isolateInTransaction(async () => {
          const { id } =
            ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

          const requestBody = ChangeQuantityDtoBuilder.defaultAll().with({
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
            eventName: expectedEventName,
            createdAt: now,
            value: expectedResponse,
          }).result;

          const { body } = await productsClient(app)
            .changeQuantity(requestBody)
            .expectStatus(HttpStatus.OK);

          expect(body).toStrictEqual(expectedResponse);
          await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
          await expectProductEventInDB({
            txHost,
            aggregateId: id,
          }).toStrictEqual(expectedEvent);
        }, txHost);
      },
    );

    it.concurrent.each(reduceCases)(
      '%s',
      { timeout: CASE_TIMEOUT },
      async ({ changes, expectedEventName }) => {
        await isolateInTransaction(async () => {
          const { id } =
            ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

          const requestBody = ChangeQuantityDtoBuilder.defaultAll().with({
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
            eventName: expectedEventName,
            createdAt: now,
            value: expectedResponse,
          }).result;

          const { body } = await productsClient(app)
            .changeQuantity(requestBody)
            .expectStatus(HttpStatus.OK);

          expect(body).toStrictEqual(expectedResponse);
          await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
          await expectProductEventInDB({
            txHost,
            aggregateId: id,
          }).toStrictEqual(expectedEvent);
        }, txHost);
      },
    );

    it.concurrent.each(noOpCases)(
      '%s',
      { timeout: CASE_TIMEOUT },
      async ({ changes }) => {
        await isolateInTransaction(async () => {
          const { id } =
            ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

          const requestBody = ChangeQuantityDtoBuilder.defaultAll().with({
            ...changes,
            productId: id,
          }).result;
          const expectedResponse = ProductDtoBuilder.defaultAll().with({
            id,
          }).result;
          const expectedEntity = ProductEntityBuilder.defaultAll().with({
            id,
          }).result;
          const expectedEvent = null;

          const { body } = await productsClient(app)
            .changeQuantity(requestBody)
            .expectStatus(HttpStatus.OK);

          expect(body).toStrictEqual(expectedResponse);
          await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
          await expectProductEventInDB({
            txHost,
            aggregateId: id,
          }).toStrictEqual(expectedEvent);
        }, txHost);
      },
    );
  });

  describe.concurrent(ProductController.prototype.delete.name, () => {
    it.concurrent.each(deleteCases)(
      '%s',
      { timeout: CASE_TIMEOUT },
      async () => {
        await isolateInTransaction(async () => {
          const { id } =
            ProductFixtures[ProductFixtureNamesEnum.DEFAULT_PRODUCT];

          const expectedResponse = ProductDtoBuilder.defaultAll().with({
            id,
            updatedAt: now.toISOString(),
            removedAt: now.toISOString(),
          }).result;
          const expectedEntity = ProductEntityBuilder.defaultAll().with({
            id,
            updatedAt: now,
            removedAt: now,
          }).result;
          const expectedEvent = ProductEventEntityBuilder.defaultAll().with({
            aggregateId: id,
            eventName: ProductEventNameEnum.PRODUCT_WAS_DELETED,
            createdAt: now,
            value: expectedResponse,
          }).result;

          const { body } = await productsClient(app)
            .delete(id)
            .expectStatus(HttpStatus.OK);

          expect(body).toStrictEqual(expectedResponse);
          await expectProductInDB({ txHost, id }).toStrictEqual(expectedEntity);
          await expectProductEventInDB({
            txHost,
            aggregateId: id,
          }).toStrictEqual(expectedEvent);
        }, txHost);
      },
    );
  });
});
