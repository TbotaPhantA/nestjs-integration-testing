import type { ObjectLiteral } from 'typeorm';

export async function saveInTx<T extends ObjectLiteral>(
  txHost: any,
  entity: T | T[],
): Promise<T | T[]> {
  const target = Array.isArray(entity) ? entity[0] : entity;
  const repository = txHost.tx.getRepository(target.constructor as any);
  const saved = await repository.save(entity as any);
  return saved;
}
