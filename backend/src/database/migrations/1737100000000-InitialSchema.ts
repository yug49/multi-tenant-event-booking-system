import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1737100000000 implements MigrationInterface {
  name = 'InitialSchema1737100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create organizations table
    await queryRunner.query(`
      CREATE TABLE "organizations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "description" varchar(500),
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar(255) NOT NULL,
        "name" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "organization_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_users_organization" FOREIGN KEY ("organization_id") 
          REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_users_email" UNIQUE ("email")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_users_organization" ON "users"("organization_id")`);

    // Create resources table
    await queryRunner.query(`
      CREATE TABLE "resources" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "description" varchar(500),
        "type" varchar(20) NOT NULL,
        "organization_id" uuid,
        "is_global" boolean DEFAULT false,
        "max_concurrent_usage" integer,
        "available_quantity" integer,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_resources_organization" FOREIGN KEY ("organization_id") 
          REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "chk_resource_type" CHECK ("type" IN ('EXCLUSIVE', 'SHAREABLE', 'CONSUMABLE')),
        CONSTRAINT "chk_global_no_org" CHECK ("is_global" = false OR "organization_id" IS NULL),
        CONSTRAINT "chk_shareable_max_usage" CHECK ("type" != 'SHAREABLE' OR "max_concurrent_usage" IS NOT NULL),
        CONSTRAINT "chk_consumable_quantity" CHECK ("type" != 'CONSUMABLE' OR "available_quantity" IS NOT NULL)
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_resources_organization" ON "resources"("organization_id")`);

    // Create events table
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(255) NOT NULL,
        "description" varchar(1000),
        "start_time" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_time" TIMESTAMP WITH TIME ZONE NOT NULL,
        "capacity" integer NOT NULL,
        "organization_id" uuid NOT NULL,
        "parent_event_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_events_organization" FOREIGN KEY ("organization_id") 
          REFERENCES "organizations"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_events_parent" FOREIGN KEY ("parent_event_id") 
          REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "chk_event_time_valid" CHECK ("end_time" > "start_time")
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_events_organization" ON "events"("organization_id")`);
    await queryRunner.query(`CREATE INDEX "idx_events_time_range" ON "events"("start_time", "end_time")`);
    await queryRunner.query(`CREATE INDEX "idx_events_parent" ON "events"("parent_event_id")`);

    // Create event_registrations table
    await queryRunner.query(`
      CREATE TABLE "event_registrations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" uuid NOT NULL,
        "user_id" uuid,
        "external_email" varchar(255),
        "checkin_time" TIMESTAMP WITH TIME ZONE,
        "registered_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_registrations_event" FOREIGN KEY ("event_id") 
          REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_registrations_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_registration_event_user" UNIQUE ("event_id", "user_id"),
        CONSTRAINT "chk_user_or_external" CHECK (
          ("user_id" IS NOT NULL AND "external_email" IS NULL) OR 
          ("user_id" IS NULL AND "external_email" IS NOT NULL)
        )
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_registrations_event" ON "event_registrations"("event_id")`);
    await queryRunner.query(`CREATE INDEX "idx_registrations_user" ON "event_registrations"("user_id")`);

    // Create resource_allocations table
    await queryRunner.query(`
      CREATE TABLE "resource_allocations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "event_id" uuid NOT NULL,
        "resource_id" uuid NOT NULL,
        "quantity_used" integer,
        "allocated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_allocations_event" FOREIGN KEY ("event_id") 
          REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_allocations_resource" FOREIGN KEY ("resource_id") 
          REFERENCES "resources"("id") ON DELETE CASCADE,
        CONSTRAINT "uq_allocation_event_resource" UNIQUE ("event_id", "resource_id"),
        CONSTRAINT "chk_quantity_positive" CHECK ("quantity_used" IS NULL OR "quantity_used" > 0)
      )
    `);
    await queryRunner.query(`CREATE INDEX "idx_allocations_event" ON "resource_allocations"("event_id")`);
    await queryRunner.query(`CREATE INDEX "idx_allocations_resource" ON "resource_allocations"("resource_id")`);

    // Create materialized view for resource utilization metrics
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW "mv_resource_utilization" AS
      SELECT 
        r.id AS resource_id,
        r.name AS resource_name,
        r.type AS resource_type,
        r.organization_id,
        r.is_global,
        COUNT(DISTINCT ra.event_id) AS total_allocations,
        COALESCE(SUM(
          EXTRACT(EPOCH FROM (e.end_time - e.start_time)) / 3600
        ), 0) AS total_hours_used,
        COALESCE(SUM(ra.quantity_used), 0) AS total_quantity_consumed
      FROM resources r
      LEFT JOIN resource_allocations ra ON r.id = ra.resource_id
      LEFT JOIN events e ON ra.event_id = e.id
      GROUP BY r.id, r.name, r.type, r.organization_id, r.is_global
    `);

    // Create index on materialized view
    await queryRunner.query(`CREATE UNIQUE INDEX "idx_mv_resource_utilization_resource" ON "mv_resource_utilization"("resource_id")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_mv_resource_utilization_resource"`);
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "mv_resource_utilization"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resource_allocations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "event_registrations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "resources"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "organizations"`);
  }
}
