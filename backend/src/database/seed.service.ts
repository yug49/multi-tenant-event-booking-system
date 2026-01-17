import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    // Only seed if SEED_ON_START is set
    if (process.env.SEED_ON_START !== 'true') {
      this.logger.log('SEED_ON_START not set, skipping seeding');
      return;
    }

    this.logger.log('Checking if database needs seeding...');
    
    try {
      // Wait a moment for tables to be created by synchronize
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const queryRunner = this.dataSource.createQueryRunner();
      
      try {
        // Check if data already exists
        const existingOrgs = await queryRunner.query('SELECT COUNT(*) as count FROM organizations');
        if (parseInt(existingOrgs[0].count) > 0) {
          this.logger.log('Database already has data. Skipping seed.');
          return;
        }

        this.logger.log('Seeding database with initial data...');
        await this.seedDatabase(queryRunner);
        this.logger.log('Database seeding completed successfully!');
      } finally {
        await queryRunner.release();
      }
    } catch (error) {
      this.logger.error('Error during seeding:', error);
      // Don't throw - let the app continue even if seeding fails
    }
  }

  private async seedDatabase(queryRunner: any) {
    await queryRunner.startTransaction();

    try {
      // Organizations
      const org1Id = uuidv4();
      const org2Id = uuidv4();
      const org3Id = uuidv4();

      await queryRunner.query(
        `INSERT INTO organizations (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())`,
        [org1Id, 'TechCorp Inc.', 'Leading technology company'],
      );
      await queryRunner.query(
        `INSERT INTO organizations (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())`,
        [org2Id, 'EventPro Agency', 'Professional event management'],
      );
      await queryRunner.query(
        `INSERT INTO organizations (id, name, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())`,
        [org3Id, 'StartupHub', 'Co-working and startup incubator'],
      );

      // Users
      const user1Id = uuidv4();
      const user2Id = uuidv4();
      const user3Id = uuidv4();
      const user4Id = uuidv4();
      const user5Id = uuidv4();
      const user6Id = uuidv4();
      const user7Id = uuidv4();
      const passwordHash = '$2b$10$dummyhashfordevelopment';

      await queryRunner.query(
        `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [user1Id, 'alice@techcorp.com', 'Alice Johnson', passwordHash, org1Id],
      );
      await queryRunner.query(
        `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [user2Id, 'bob@techcorp.com', 'Bob Smith', passwordHash, org1Id],
      );
      await queryRunner.query(
        `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [user3Id, 'carol@techcorp.com', 'Carol Williams', passwordHash, org1Id],
      );
      await queryRunner.query(
        `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [user4Id, 'david@eventpro.com', 'David Brown', passwordHash, org2Id],
      );
      await queryRunner.query(
        `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [user5Id, 'eva@eventpro.com', 'Eva Martinez', passwordHash, org2Id],
      );
      await queryRunner.query(
        `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [user6Id, 'frank@startuphub.com', 'Frank Lee', passwordHash, org3Id],
      );
      await queryRunner.query(
        `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [user7Id, 'grace@startuphub.com', 'Grace Kim', passwordHash, org3Id],
      );

      // Resources - Global
      const globalRoom1Id = uuidv4();
      const globalRoom2Id = uuidv4();
      const globalEquip1Id = uuidv4();

      await queryRunner.query(
        `INSERT INTO resources (id, name, description, type, is_global, max_concurrent_usage, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [globalRoom1Id, 'Main Conference Hall', 'Large conference room with 200 seats', 'EXCLUSIVE', true, null],
      );
      await queryRunner.query(
        `INSERT INTO resources (id, name, description, type, is_global, max_concurrent_usage, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [globalRoom2Id, 'Auditorium', 'Main auditorium with stage', 'EXCLUSIVE', true, null],
      );
      await queryRunner.query(
        `INSERT INTO resources (id, name, description, type, is_global, max_concurrent_usage, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [globalEquip1Id, 'Projector Pool', 'Shared projectors', 'SHAREABLE', true, 5],
      );

      // Resources - Organization specific
      const techRoom1Id = uuidv4();
      const techLaptopsId = uuidv4();
      const eventCateringId = uuidv4();

      await queryRunner.query(
        `INSERT INTO resources (id, name, description, type, organization_id, is_global, max_concurrent_usage, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [techRoom1Id, 'TechCorp Meeting Room A', 'Small meeting room', 'EXCLUSIVE', org1Id, false, null],
      );
      await queryRunner.query(
        `INSERT INTO resources (id, name, description, type, organization_id, is_global, available_quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [techLaptopsId, 'Demo Laptops', 'Laptops for demos', 'CONSUMABLE', org1Id, false, 10],
      );
      await queryRunner.query(
        `INSERT INTO resources (id, name, description, type, organization_id, is_global, available_quantity, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [eventCateringId, 'Catering Packages', 'Food and beverage packages', 'CONSUMABLE', org2Id, false, 20],
      );

      // Events
      const now = new Date();
      const event1Id = uuidv4();
      const event2Id = uuidv4();
      const event3Id = uuidv4();
      const childEvent1Id = uuidv4();

      const event1Start = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      event1Start.setHours(9, 0, 0, 0);
      const event1End = new Date(event1Start.getTime() + 8 * 60 * 60 * 1000);

      await queryRunner.query(
        `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [event1Id, 'Tech Conference 2026', 'Annual technology conference', event1Start, event1End, 150, org1Id],
      );

      const event2Start = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      event2Start.setHours(10, 0, 0, 0);
      const event2End = new Date(event2Start.getTime() + 6 * 60 * 60 * 1000);

      await queryRunner.query(
        `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [event2Id, 'EventPro Annual Summit', 'Annual industry summit', event2Start, event2End, 200, org2Id],
      );

      // Child event with time violation (ends after parent)
      const childStart = new Date(event2Start.getTime() + 5 * 60 * 60 * 1000);
      const childEnd = new Date(event2End.getTime() + 2 * 60 * 60 * 1000);

      await queryRunner.query(
        `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
        [childEvent1Id, 'Closing Panel', 'Closing panel discussion', childStart, childEnd, 50, org2Id, event2Id],
      );

      const event3Start = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
      event3Start.setHours(14, 0, 0, 0);
      const event3End = new Date(event3Start.getTime() + 4 * 60 * 60 * 1000);

      await queryRunner.query(
        `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [event3Id, 'Startup Pitch Day', 'Startup pitch competition', event3Start, event3End, 100, org3Id],
      );

      // Create an overlapping event (same time as event1) to cause double-booking
      const overlapEvent1Id = uuidv4();
      await queryRunner.query(
        `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [overlapEvent1Id, 'Product Launch Meeting', 'New product launch planning', event1Start, event1End, 30, org1Id],
      );

      // Create another overlapping event for event2
      const overlapEvent2Id = uuidv4();
      const overlap2Start = new Date(event2Start.getTime() + 2 * 60 * 60 * 1000); // Starts 2 hours into event2
      const overlap2End = new Date(event2Start.getTime() + 5 * 60 * 60 * 1000);   // Ends before event2
      await queryRunner.query(
        `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [overlapEvent2Id, 'VIP Networking Session', 'Exclusive networking for VIPs', overlap2Start, overlap2End, 25, org2Id],
      );

      // Event Registrations
      await queryRunner.query(
        `INSERT INTO event_registrations (id, event_id, user_id, registered_at) VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), event1Id, user1Id],
      );
      await queryRunner.query(
        `INSERT INTO event_registrations (id, event_id, user_id, registered_at) VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), event1Id, user2Id],
      );
      
      // DOUBLE-BOOKING: Alice registered to overlapping event (same time as event1)
      await queryRunner.query(
        `INSERT INTO event_registrations (id, event_id, user_id, registered_at) VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), overlapEvent1Id, user1Id],
      );
      // DOUBLE-BOOKING: Bob also double-booked
      await queryRunner.query(
        `INSERT INTO event_registrations (id, event_id, user_id, registered_at) VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), overlapEvent1Id, user2Id],
      );
      
      await queryRunner.query(
        `INSERT INTO event_registrations (id, event_id, user_id, registered_at) VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), event2Id, user4Id],
      );
      await queryRunner.query(
        `INSERT INTO event_registrations (id, event_id, user_id, registered_at) VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), event2Id, user5Id],
      );
      
      // DOUBLE-BOOKING: David registered to overlapping VIP session
      await queryRunner.query(
        `INSERT INTO event_registrations (id, event_id, user_id, registered_at) VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), overlapEvent2Id, user4Id],
      );

      // External attendees
      for (let i = 1; i <= 6; i++) {
        await queryRunner.query(
          `INSERT INTO event_registrations (id, event_id, external_email, registered_at) VALUES ($1, $2, $3, NOW())`,
          [uuidv4(), event2Id, `external${i}@guest.com`],
        );
      }

      // Resource Allocations
      await queryRunner.query(
        `INSERT INTO resource_allocations (id, event_id, resource_id, allocated_at) VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), event1Id, globalRoom1Id],
      );
      await queryRunner.query(
        `INSERT INTO resource_allocations (id, event_id, resource_id, allocated_at) VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), event2Id, globalRoom2Id],
      );
      await queryRunner.query(
        `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at) VALUES ($1, $2, $3, $4, NOW())`,
        [uuidv4(), event1Id, techLaptopsId, 5],
      );
      
      // RESOURCE VIOLATION: Same exclusive room allocated to overlapping event
      await queryRunner.query(
        `INSERT INTO resource_allocations (id, event_id, resource_id, allocated_at) VALUES ($1, $2, $3, NOW())`,
        [uuidv4(), overlapEvent1Id, globalRoom1Id],
      );
      
      // Shareable resource usage (no violation - within limit)
      await queryRunner.query(
        `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at) VALUES ($1, $2, $3, $4, NOW())`,
        [uuidv4(), event1Id, globalEquip1Id, 2],
      );
      await queryRunner.query(
        `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at) VALUES ($1, $2, $3, $4, NOW())`,
        [uuidv4(), overlapEvent1Id, globalEquip1Id, 4],
      );
      // This causes SHAREABLE RESOURCE VIOLATION: 2 + 4 = 6 > 5 max concurrent

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }
}
