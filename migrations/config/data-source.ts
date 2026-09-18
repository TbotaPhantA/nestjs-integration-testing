// src/database/data-source.ts
import { DataSource } from 'typeorm';

export function ensureTruthy<T>(param: T | undefined | null, error?: string | Error): T {
  if (!param) {
    if (!error) {
      throw new Error('Given param is not truthy')
    }
    if (typeof error === 'string') {
      throw new Error(error)
    }
    throw error
  }
  return param
}

export function ensureNumber<T>(n: T, error?: string | Error): number {
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    throw error instanceof Error
      ? error
      : new Error(error ?? `Expected a number, got ${typeof n}`);
  }

  return n;
}

export default new DataSource({
  type: 'postgres',
  host: ensureTruthy(process.env.DB_HOST),
  port: ensureNumber(Number(process.env.DB_PORT)),
  username: ensureTruthy(process.env.DB_USERNAME),
  password: ensureTruthy(process.env.DB_PASSWORD),
  database: ensureTruthy(process.env.DB_NAME),
  entities: ['src/**/*.entity.ts'],
  migrations: ['migrations/*.ts'],
  synchronize: false,
});
