import type { ProductEntity } from '../domain/product.entity.js';

export class ProductDto {
  id: number
  name: string
  description: string
  quantity: number
  createdAt: Date
  updatedAt: Date
  removedAt: Date | null

  static from(product: ProductEntity): ProductDto {
    const dto = new ProductDto()
    dto.id = product.id
    dto.name = product.name
    dto.description = product.description
    dto.quantity = product.quantity
    dto.createdAt = product.createdAt
    dto.updatedAt = product.updatedAt
    dto.removedAt = product.removedAt
    return dto
  }
}
