import { NoMethods } from '../../shared/types/noMethods.js';
import { PLACEHOLDER_ID } from '../../shared/constants/placeholderId.js';
import type { PickOptional } from '../../shared/types/pickOptional.js';
import { CreateProductDto } from '../dto/createProduct.dto.js';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  description: string

  @Column()
  quantity: number

  @Column({ name: 'created_at' })
  createdAt: Date

  @Column({ name: 'updated_at' })
  updatedAt: Date

  @Column({ name: 'removed_at', nullable: true })
  removedAt: Date | null

  constructor(raw: PickOptional<NoMethods<ProductEntity>, 'id'>) {
    this.id = raw.id ?? PLACEHOLDER_ID
    this.name = raw.name
    this.description = raw.description
    this.quantity = raw.quantity
    this.createdAt = raw.createdAt
    this.updatedAt = raw.updatedAt
    this.removedAt = raw.removedAt
  }

  static createByDto(dto: CreateProductDto): ProductEntity {
    const now = new Date()
    return new ProductEntity({
      name: dto.name,
      description: dto.description,
      quantity: dto.quantity,
      createdAt: now,
      updatedAt: now,
      removedAt: null,
    })
  }
}
