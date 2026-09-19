import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import type { ProductEntity } from './product.entity.js';
import type { NoMethods } from '../../shared/types/noMethods.js';
import type { PickOptional } from '../../shared/types/pickOptional.js';
import { PLACEHOLDER_ID } from '../../shared/constants/placeholderId.js';

export enum ProductEventNameEnum {
  PRODUCT_WAS_CREATED="PRODUCT_WAS_CREATED",
  PRODUCT_WAS_RE_DESCRIBED="PRODUCT_WAS_RE_DESCRIBED",
  PRODUCT_QUANTITY_WAS_REDUCED="PRODUCT_QUANTITY_WAS_REDUCED",
  PRODUCT_QUANTITY_WAS_INCREASED="PRODUCT_QUANTITY_WAS_INCREASED",
  PRODUCT_WAS_DELETED="PRODUCT_WAS_DELETED",
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

  static createFromRaw(raw: PickOptional<NoMethods<ProductEventEntity>, 'messageId'>) {
    const entity = new ProductEventEntity()
    entity.messageId = raw.messageId ?? PLACEHOLDER_ID
    entity.eventName = raw.eventName
    entity.aggregateId = raw.aggregateId
    entity.value = raw.value
    return entity
  }

  static create(params: Pick<ProductEventEntity, 'eventName' | 'value'>) {
    return ProductEventEntity.createFromRaw({
      eventName: params.eventName,
      aggregateId: params.value.id,
      value: params.value,
      createdAt: params.value.createdAt,
    })
  }
}
