import { defineFixtures } from './defineFixtures.js';

describe('defineFixtures', () => {
  it('computes id from hash of name', () => {
    const hash = (input: string) => {
      let h = 0;
      for (let i = 0; i < input.length; i++) {
        h = (h * 31 + input.charCodeAt(i)) % 0x20000000000000;
      }
      return h.toString();
    };

    const fixtures = defineFixtures({
      DEFAULT_PRODUCT: (id) => [
        { entity: 'product' as any, data: { id, name: 'name' } },
      ],
    });

    expect(fixtures.DEFAULT_PRODUCT.id).toBe(hash('DEFAULT_PRODUCT'));
    expect(fixtures.DEFAULT_PRODUCT.name).toBe('DEFAULT_PRODUCT');
    expect(fixtures.DEFAULT_PRODUCT.rows[0].data.id).toBe(
      fixtures.DEFAULT_PRODUCT.id,
    );
  });

  it('exposes idOf', () => {
    const fixtures = defineFixtures({
      DEFAULT_PRODUCT: (id) => [{ entity: 'product' as any, data: { id } }],
    });

    expect(fixtures.idOf('DEFAULT_PRODUCT')).toBe(fixtures.DEFAULT_PRODUCT.id);
  });

  it('returns multiple rows when factory returns them', () => {
    const fixtures = defineFixtures({
      DEFAULT_PRODUCT: (id) => [
        { entity: 'p1' as any, data: { id: id + '1' } },
        { entity: 'p2' as any, data: { id: id + '2' } },
      ],
    });

    expect(fixtures.DEFAULT_PRODUCT.rows).toHaveLength(2);
  });
});
