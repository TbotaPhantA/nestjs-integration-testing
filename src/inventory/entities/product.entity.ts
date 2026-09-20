import { NoMethods } from '../../shared/types/noMethods.js';
import { PLACEHOLDER_ID } from '../../shared/constants/placeholderId.js';
import type { PickOptional } from '../../shared/types/pickOptional.js';
import { CreateProductDto } from '../dto/createProduct.dto.js';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { ProductEventEntity, ProductEventNameEnum } from './productEvent.entity.js';
import { ReDescribeProductDto } from '../dto/reDescribeProduct.dto.js';
import { ChangeQuantityDto } from '../dto/changeQuantity.dto.js';
import { assert } from '../../shared/utils/assert/assert.js';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn({ type: 'int8' })
  id: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'removed_at', nullable: true })
  removedAt: Date | null

  @Column({ type: 'int2' })
  quantity: number

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'varchar', length: 10_000 })
  description: string

  #uncommittedEvents = new Array<ProductEventEntity>()

  static createFromRaw(raw: PickOptional<NoMethods<ProductEntity>, 'id'>) {
    const entity = new ProductEntity()
    entity.id = raw.id ?? PLACEHOLDER_ID
    entity.name = raw.name
    entity.description = raw.description
    entity.quantity = raw.quantity
    entity.createdAt = raw.createdAt
    entity.updatedAt = raw.updatedAt
    entity.removedAt = raw.removedAt
    return entity
  }

  exportEvents(): ProductEventEntity[] {
    assert(this.id !== PLACEHOLDER_ID, "Events can't be exported before insertion")
    this.#uncommittedEvents.forEach(event => {
      event.aggregateId = this.id
      event.value.id = this.id;
    })
    return this.#uncommittedEvents
  }

  static createByDto(dto: CreateProductDto): ProductEntity {
    const now = new Date()
    const product = ProductEntity.createFromRaw({
      name: dto.name,
      description: dto.description,
      quantity: dto.quantity,
      createdAt: now,
      updatedAt: now,
      removedAt: null,
    })
    product.#uncommittedEvents.push(
      ProductEventEntity.create({
        eventName: ProductEventNameEnum.PRODUCT_WAS_CREATED,
        value: product,
      })
    )
    return product
  }

  reDescribe(dto: ReDescribeProductDto): void {
    this.name = dto.name
    this.description = dto.description
    this.#uncommittedEvents.push(
      ProductEventEntity.create({
        eventName: ProductEventNameEnum.PRODUCT_WAS_RE_DESCRIBED,
        value: this,
      })
    )
  }


  changeQuantity(dto: ChangeQuantityDto): void {
    if (dto.quantity === this.quantity) return;
    const eventName = dto.quantity > this.quantity
      ? ProductEventNameEnum.PRODUCT_QUANTITY_WAS_INCREASED
      : ProductEventNameEnum.PRODUCT_QUANTITY_WAS_REDUCED
    this.quantity = dto.quantity
    this.#uncommittedEvents.push(
      ProductEventEntity.create({ eventName, value: this })
    )
  }

  markAsDeleted() {
    this.removedAt = new Date()
    this.#uncommittedEvents.push(
      ProductEventEntity.create({
        eventName: ProductEventNameEnum.PRODUCT_WAS_DELETED,
        value: this,
      })
    )
  }
}
