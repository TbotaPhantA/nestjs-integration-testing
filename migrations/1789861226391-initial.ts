import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1789861226391 implements MigrationInterface {
    name = 'Initial1789861226391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_events_event_name_enum" AS ENUM('PRODUCT_WAS_CREATED', 'PRODUCT_WAS_RE_DESCRIBED', 'PRODUCT_QUANTITY_WAS_REDUCED', 'PRODUCT_QUANTITY_WAS_INCREASED', 'PRODUCT_WAS_DELETED')`);
        await queryRunner.query(`CREATE TABLE "product_events" ("message_id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "event_name" "public"."product_events_event_name_enum" NOT NULL, "aggregate_id" bigint NOT NULL, "value" jsonb NOT NULL, CONSTRAINT "PK_25df79485f823d3aa644e56827d" PRIMARY KEY ("message_id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" BIGSERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "removed_at" TIMESTAMP, "quantity" smallint NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(10000) NOT NULL, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "product_events"`);
        await queryRunner.query(`DROP TYPE "public"."product_events_event_name_enum"`);
    }

}
