import { Injectable } from '@nestjs/common';
import { ProductEntity } from '../domain/product.entity.js';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

@Injectable()
export class ProductRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  save(product: ProductEntity): Promise<ProductEntity> {
    return this.txHost.tx.getRepository(ProductEntity).save(product)
  }
}
