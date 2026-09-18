import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1789773169626 implements MigrationInterface {
  name = 'Initial1789773169626';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."product_events_event_name_enum" AS ENUM (
        'ProductWasCreated',
        'ProductWasReDescribed',
        'ProductQuantityWasReduced',
        'ProductQuantityWasIncreased',
        'ProductWasDeleted'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "product_events" (
        "message_id" BIGSERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "event_name" "public"."product_events_event_name_enum" NOT NULL,
        "aggregate_id" BIGINT NOT NULL,
        "value" JSONB NOT NULL,
        CONSTRAINT "PK_25df79485f823d3aa644e56827d"
        PRIMARY KEY ("message_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" BIGSERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "removed_at" TIMESTAMP,
        "quantity" SMALLINT NOT NULL,
        "name" VARCHAR(100) NOT NULL,
        "description" VARCHAR(10000) NOT NULL,
        CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d"
      PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "products"
    `);

    await queryRunner.query(`
      DROP TABLE "product_events"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."product_events_event_name_enum"
    `);
  }
}
