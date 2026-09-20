import { plainToInstance } from 'class-transformer';
import type { ValueTransformer } from 'typeorm';

export function jsonbToInstance<T>(
  Class: new (...args: never[]) => T,
): ValueTransformer {
  return {
    to(value: T): unknown {
      return value;
    },

    from(value: unknown): T {
      // @ts-ignore
      return plainToInstance(Class, value);
    },
  };
}
