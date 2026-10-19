import { describe, expect, it } from 'vitest';
import {
  ProductEntityBuilder,
  ProductFixtureNames,
} from './productEntity.builder.js';
import { hashInt2 } from '../../../../../../fixtures/hashes/hashInt2.js';

describe(ProductEntityBuilder.name, () => {
  it('defaultAll carries the placeholder id', () => {
    expect(ProductEntityBuilder.defaultAll().result.id).toBe('1');
  });

  it('derives the fixture id from the hash of its name', () => {
    const product =
      ProductEntityBuilder[ProductFixtureNames.DEFAULT_PRODUCT].result;

    expect(product.id).toBe(
      hashInt2(ProductFixtureNames.DEFAULT_PRODUCT).toString(),
    );
  });

  it('returns a fresh builder on every fixture access', () => {
    const first = ProductEntityBuilder[
      ProductFixtureNames.DEFAULT_PRODUCT
    ].with({
      name: 'mutated',
    }).result;
    const second =
      ProductEntityBuilder[ProductFixtureNames.DEFAULT_PRODUCT].result;

    expect(first.name).toBe('mutated');
    expect(second.name).toBe('name');
  });
});
