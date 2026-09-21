import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

const ROLLBACK = Symbol('ROLLBACK');

export async function isolateInTransaction<T>(
  callback: () => Promise<T>,
  txHost: TransactionHost<TransactionalAdapterTypeOrm>
): Promise<T> {
  let result!: T;

  try {
    await txHost.withTransaction(async () => {
      result = await callback();

      throw ROLLBACK;
    });
  } catch (error) {
    if (error !== ROLLBACK) {
      throw error;
    }
  }

  return result;
}
