import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import type { ProductEntity } from './product.entity.js';
import type { NoMethods } from '../../shared/types/noMethods.js';
import type { PickOptional } from '../../shared/types/pickOptional.js';
import { PLACEHOLDER_ID } from '../../shared/constants/placeholderId.js';

@Entity({ name: 'product_events' })
export class ProductEventEntity {
  @PrimaryGeneratedColumn({ name: 'message_id' })
  messageId: number

  @Column({ name: 'event_name', type: 'enum' })
  eventName: ProductEventNameEnum

  @Column({ name: 'aggregate_id', type: 'varchar', length: 100 })
  aggregateId: string

  @Column({ type: 'jsonb' })
  value: ProductEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  constructor(raw: PickOptional<NoMethods<ProductEventEntity>, 'messageId'>) {
    this.messageId = raw.messageId ?? PLACEHOLDER_ID
    this.eventName = raw.eventName
    this.aggregateId = raw.aggregateId
    this.value = raw.value
  }

  static create(params: Pick<ProductEventEntity, 'eventName' | 'value'>) {
    return new ProductEventEntity({
      eventName: params.eventName,
      aggregateId: params.value.id.toString(),
      value: params.value,
      createdAt: params.value.createdAt,
    })
  }
}

export enum ProductEventNameEnum {
  ProductWasCreated="ProductWasCreated",
  ProductWasReDescribed="ProductWasReDescribed",
  ProductQuantityWasReduced="ProductQuantityWasReduced",
  ProductQuantityWasIncreased="ProductQuantityWasIncreased",
  ProductWasDeleted="ProductWasDeleted",
}
