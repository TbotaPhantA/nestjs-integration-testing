import type { ProductEntity } from '../entities/product.entity.js';
import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty()
  description: string

  @ApiProperty()
  quantity: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty()
  removedAt: Date | null

  static from(product: ProductEntity): ProductDto {
    const dto = new ProductDto()
    dto.id = product.id.toString()
    dto.name = product.name
    dto.description = product.description
    dto.quantity = product.quantity
    dto.createdAt = product.createdAt
    dto.updatedAt = product.updatedAt
    dto.removedAt = product.removedAt
    return dto
  }
}
