import { Module } from '@nestjs/common';
import { InfraModule } from './shared/infra/infra.module.js';
import { InventoryModule } from './inventory/inventory.module.js';

@Module({
  imports: [InfraModule, InventoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
