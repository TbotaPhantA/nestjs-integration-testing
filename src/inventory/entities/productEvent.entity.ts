import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import type { ProductEntity } from './product.entity.js';
import type { NoMethods } from '../../shared/types/noMethods.js';
import type { PickOptional } from '../../shared/types/pickOptional.js';
import { PLACEHOLDER_ID } from '../../shared/constants/placeholderId.js';
import { ProductResponseDto } from '../dto/productResponseDto.js';
import { jsonbToInstance } from '../../shared/transformers/jsonToInstance.js';

export enum ProductEventNameEnum {
  PRODUCT_WAS_CREATED="PRODUCT_WAS_CREATED",
  PRODUCT_WAS_RE_DESCRIBED="PRODUCT_WAS_RE_DESCRIBED",
  PRODUCT_QUANTITY_WAS_REDUCED="PRODUCT_QUANTITY_WAS_REDUCED",
  PRODUCT_QUANTITY_WAS_INCREASED="PRODUCT_QUANTITY_WAS_INCREASED",
  PRODUCT_WAS_DELETED="PRODUCT_WAS_DELETED",
}

interface CreateParams {
  eventName: ProductEventNameEnum
  value: ProductEntity
}

@Entity({ name: 'product_events' })
export class ProductEventEntity {
  @PrimaryGeneratedColumn({ name: 'message_id', type: 'int8' })
  messageId: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'event_name', type: 'enum', enum: ProductEventNameEnum })
  eventName: ProductEventNameEnum

  @Column({ name: 'aggregate_id', type: 'int8' })
  aggregateId: string

  @Column({ type: 'jsonb', transformer: jsonbToInstance(ProductResponseDto) })
  value: ProductResponseDto

  static createFromRaw(raw: PickOptional<NoMethods<ProductEventEntity>, 'messageId'>) {
    const entity = new ProductEventEntity()
    entity.messageId = raw.messageId ?? PLACEHOLDER_ID
    entity.eventName = raw.eventName
    entity.aggregateId = raw.aggregateId
    entity.createdAt = raw.createdAt
    entity.value = raw.value
    return entity
  }

  static create({
    eventName,
    value,
  }: CreateParams) {
    return ProductEventEntity.createFromRaw({
      eventName,
      aggregateId: value.id,
      value: ProductResponseDto.from(value),
      createdAt: value.updatedAt,
    })
  }
}
