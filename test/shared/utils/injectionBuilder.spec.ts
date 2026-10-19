import { describe, expect, it } from 'vitest';
import { inject, InjectionBuilder } from './injectionBuilder.js';

describe(InjectionBuilder.name, () => {
  it('inject wraps an existing value in a builder', () => {
    const value = { id: '1', name: 'name' };

    const builder = inject(value);

    expect(builder).toBeInstanceOf(InjectionBuilder);
    expect(builder.result).toBe(value);
  });

  it('with mutates the target and returns the same builder', () => {
    const builder = inject({ id: '1', name: 'name' });

    const returned = builder.with({ name: 'updated' });

    expect(returned).toBe(builder);
    expect(builder.result).toStrictEqual({ id: '1', name: 'updated' });
  });

  it('omit returns a new builder without the omitted keys', () => {
    const builder = inject({ id: '1', name: 'name' });

    const omitted = builder.omit('id');

    expect(omitted).not.toBe(builder);
    expect(omitted.result).toStrictEqual({ name: 'name' });
    expect(builder.result).toStrictEqual({ id: '1', name: 'name' });
  });
});
