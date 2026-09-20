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
  createdAt: string

  @ApiProperty()
  updatedAt: string

  @ApiProperty()
  removedAt: string | null

  static from(product: ProductEntity): ProductDto {
    const dto = new ProductDto()
    dto.id = product.id.toString()
    dto.name = product.name
    dto.description = product.description
    dto.quantity = product.quantity
    dto.createdAt = product.createdAt.toISOString()
    dto.updatedAt = product.updatedAt.toISOString()
    dto.removedAt = product.removedAt?.toISOString() ?? null
    return dto
  }
}
