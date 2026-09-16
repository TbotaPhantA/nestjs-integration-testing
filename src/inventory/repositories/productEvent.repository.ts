import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ProductEventEntity } from '../domain/productEvent.entity.js';

@Injectable()
export class ProductEventRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  save(events: ProductEventEntity[]): Promise<ProductEventEntity[]> {
    return this.txHost.tx.getRepository(ProductEventEntity).save(events)
  }
}
