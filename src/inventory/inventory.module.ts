import { Module } from '@nestjs/common';
import { ProductController } from './product.controller.js';
import { ProductService } from './product.service.js';
import { ProductRepository } from './product.repository.js';

@Module({
  controllers: [ProductController],
  providers: [ProductService, ProductRepository],
})
export class InventoryModule {}
