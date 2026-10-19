import type { EntityTarget, ObjectLiteral } from 'typeorm';
import { hashInt8 } from './hashes/hashInt8.js';

export type FixtureRow = {
  entity: EntityTarget<ObjectLiteral>;
  data: ObjectLiteral;
};

export type DefinedFixture = {
  name: string;
  id: string;
  rows: FixtureRow[];
};

export function idOf<T extends Record<string, any>>(
  fixtures: T,
  name: keyof T,
): string {
  return fixtures[name].id;
}

export function defineFixtures<
  T extends Record<string, (id: string) => FixtureRow[]>,
>(
  factories: T,
): {
  [K in keyof T]: DefinedFixture & {
    id: string;
    rows: ReturnType<T[K]>;
  };
} & {
  idOf: (name: keyof T) => string;
} {
  const entries = Object.entries(factories) as [keyof T, T[keyof T]][];
  const fixtures: any = {};

  for (const [name, factory] of entries) {
    const id = hashInt8(String(name)).toString();
    const rows = factory(id);
    fixtures[name] = {
      name: String(name),
      id,
      rows,
    };
  }

  fixtures.idOf = (name: keyof T) => fixtures[name].id;

  return fixtures as any;
}
