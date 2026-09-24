import { config } from './shared/infra/config/config.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  setupSwagger();
  await app.listen(config.port, () =>
    console.log(`Swagger - http://127.0.0.1:${config.port}/api`),
  );

  // -----------------sub functions------------------------
  function setupSwagger() {
    SwaggerModule.setup('api', app, () =>
      SwaggerModule.createDocument(
        app,
        new DocumentBuilder().setTitle('IT-support AI assistant').build(),
      ),
    );
  }
}

await bootstrap();
