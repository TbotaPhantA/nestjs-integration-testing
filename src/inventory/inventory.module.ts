import { Module } from '@nestjs/common';
import { ProductController } from './product.controller.js';
import { ProductService } from './product.service.js';
import { ProductRepository } from './repositories/product.repository.js';
import { ProductEventRepository } from './repositories/productEvent.repository.js';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductEventRepository],
})
export class InventoryModule {}
