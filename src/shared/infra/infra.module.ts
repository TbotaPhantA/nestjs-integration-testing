import { DynamicModule, Module } from '@nestjs/common';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';

import { config } from './config/config.js';
import { ProductEntity } from '../../inventory/db/product.entity.js';

const typeOrmModule = TypeOrmModule.forRoot({
  type: 'postgres',
  host: config.db.host,
  port: config.db.port,
  username: config.db.username,
  password: config.db.password,
  database: config.db.name,
  entities: [ProductEntity],
  synchronize: config.db.synchronize,
});

const clsModule = ClsModule.forRoot({
  global: true,
  middleware: {
    mount: true,
  },
  plugins: [
    new ClsPluginTransactional({
      imports: [TypeOrmModule],
      adapter: new TransactionalAdapterTypeOrm({
        dataSourceToken: getDataSourceToken(),
      }),
    }),
  ],
});

const infraModules: DynamicModule[] = [
  typeOrmModule,
  clsModule,
];

@Module({
  imports: infraModules,
  exports: infraModules,
})
export class InfraModule {}
