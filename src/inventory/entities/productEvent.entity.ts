import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import type { ProductEntity } from './product.entity.js';
import type { NoMethods } from '../../shared/types/noMethods.js';
import type { PickOptional } from '../../shared/types/pickOptional.js';
import { PLACEHOLDER_ID } from '../../shared/constants/placeholderId.js';

export enum ProductEventNameEnum {
  ProductWasCreated="ProductWasCreated",
  ProductWasReDescribed="ProductWasReDescribed",
  ProductQuantityWasReduced="ProductQuantityWasReduced",
  ProductQuantityWasIncreased="ProductQuantityWasIncreased",
  ProductWasDeleted="ProductWasDeleted",
}

@Entity({ name: 'product_events' })
export class ProductEventEntity {
  @PrimaryGeneratedColumn({ name: 'message_id', type: 'int8' })
  messageId: number

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'event_name', type: 'enum', enum: ProductEventNameEnum })
  eventName: ProductEventNameEnum

  @Column({ name: 'aggregate_id', type: 'int8' })
  aggregateId: number

  @Column({ type: 'jsonb' })
  value: ProductEntity

  constructor(raw: PickOptional<NoMethods<ProductEventEntity>, 'messageId'>) {
    this.messageId = raw.messageId ?? PLACEHOLDER_ID
    this.eventName = raw.eventName
    this.aggregateId = raw.aggregateId
    this.value = raw.value
  }

  static create(params: Pick<ProductEventEntity, 'eventName' | 'value'>) {
    return new ProductEventEntity({
      eventName: params.eventName,
      aggregateId: params.value.id,
      value: params.value,
      createdAt: params.value.createdAt,
    })
  }
}
