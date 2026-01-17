import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'event_booking',
  synchronize: false,
  logging: false,
});

async function seed() {
  console.log('Starting database seed...\n');

  await dataSource.initialize();
  const queryRunner = dataSource.createQueryRunner();

  try {
    await queryRunner.startTransaction();

    // Clear existing data in reverse order of dependencies
    console.log('Clearing existing data...');
    await queryRunner.query('DELETE FROM resource_allocations');
    await queryRunner.query('DELETE FROM event_registrations');
    await queryRunner.query('DELETE FROM events');
    await queryRunner.query('DELETE FROM resources');
    await queryRunner.query('DELETE FROM users');
    await queryRunner.query('DELETE FROM organizations');

    // ============================================
    // 1. ORGANIZATIONS
    // ============================================
    console.log('Creating organizations...');

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

    // ============================================
    // 2. USERS (across organizations)
    // ============================================
    console.log('Creating users...');

    const user1Id = uuidv4();
    const user2Id = uuidv4();
    const user3Id = uuidv4();
    const user4Id = uuidv4();
    const user5Id = uuidv4();
    const user6Id = uuidv4();
    const user7Id = uuidv4();

    const passwordHash = '$2b$10$dummyhashfordevelopment';

    // TechCorp users
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

    // EventPro users
    await queryRunner.query(
      `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [user4Id, 'david@eventpro.com', 'David Brown', passwordHash, org2Id],
    );
    await queryRunner.query(
      `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [user5Id, 'eva@eventpro.com', 'Eva Martinez', passwordHash, org2Id],
    );

    // StartupHub users
    await queryRunner.query(
      `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [user6Id, 'frank@startuphub.com', 'Frank Lee', passwordHash, org3Id],
    );
    await queryRunner.query(
      `INSERT INTO users (id, email, name, password_hash, organization_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [user7Id, 'grace@startuphub.com', 'Grace Chen', passwordHash, org3Id],
    );

    // ============================================
    // 3. RESOURCES (various types + global)
    // ============================================
    console.log('Creating resources...');

    // TechCorp resources
    const room1Id = uuidv4();
    const room2Id = uuidv4();
    const projector1Id = uuidv4();
    const laptops1Id = uuidv4();

    // EventPro resources
    const hallId = uuidv4();
    const mics1Id = uuidv4();

    // Global resources
    const globalProjectorId = uuidv4();
    const globalPrintedId = uuidv4();

    // TechCorp resources
    await queryRunner.query(
      `INSERT INTO resources (id, name, description, type, organization_id, is_global, max_concurrent_usage, available_quantity, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [room1Id, 'Conference Room A', 'Large conference room with 20 seats', 'EXCLUSIVE', org1Id, false, null, null],
    );
    await queryRunner.query(
      `INSERT INTO resources (id, name, description, type, organization_id, is_global, max_concurrent_usage, available_quantity, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [room2Id, 'Conference Room B', 'Small meeting room with 8 seats', 'EXCLUSIVE', org1Id, false, null, null],
    );
    await queryRunner.query(
      `INSERT INTO resources (id, name, description, type, organization_id, is_global, max_concurrent_usage, available_quantity, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [projector1Id, 'Projector Set', 'HD projectors for presentations', 'SHAREABLE', org1Id, false, 3, null],
    );
    await queryRunner.query(
      `INSERT INTO resources (id, name, description, type, organization_id, is_global, max_concurrent_usage, available_quantity, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [laptops1Id, 'Laptop Pool', 'Company laptops for training', 'CONSUMABLE', org1Id, false, null, 15],
    );

    // EventPro resources
    await queryRunner.query(
      `INSERT INTO resources (id, name, description, type, organization_id, is_global, max_concurrent_usage, available_quantity, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [hallId, 'Main Hall', 'Grand hall for 200 people', 'EXCLUSIVE', org2Id, false, null, null],
    );
    await queryRunner.query(
      `INSERT INTO resources (id, name, description, type, organization_id, is_global, max_concurrent_usage, available_quantity, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [mics1Id, 'Wireless Microphones', 'Professional wireless mics', 'SHAREABLE', org2Id, false, 5, null],
    );

    // Global resources
    await queryRunner.query(
      `INSERT INTO resources (id, name, description, type, organization_id, is_global, max_concurrent_usage, available_quantity, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [globalProjectorId, 'Mobile Projector Unit', 'Portable projector for any venue', 'SHAREABLE', null, true, 2, null],
    );
    await queryRunner.query(
      `INSERT INTO resources (id, name, description, type, organization_id, is_global, max_concurrent_usage, available_quantity, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [globalPrintedId, 'Printed Welcome Packets', 'Welcome materials for attendees', 'CONSUMABLE', null, true, null, 100],
    );

    // ============================================
    // 4. EVENTS (with parent-child relationships)
    // ============================================
    console.log('Creating events...');

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Event IDs
    const techConf = uuidv4();
    const techSession1 = uuidv4();
    const techSession2 = uuidv4();
    const techMeeting = uuidv4();
    const techWorkshop = uuidv4();
    const gala = uuidv4();
    const eventProConf = uuidv4();
    const eventProChild = uuidv4();
    const pitchDay = uuidv4();
    const networkEvent = uuidv4();

    // TechCorp: Tech Conference (parent) - 9 AM to 5 PM tomorrow
    const techConfStart = new Date(tomorrow);
    techConfStart.setHours(9, 0, 0, 0);
    const techConfEnd = new Date(tomorrow);
    techConfEnd.setHours(17, 0, 0, 0);

    // Morning Session - 9 AM to 12 PM (within parent)
    const session1Start = new Date(tomorrow);
    session1Start.setHours(9, 0, 0, 0);
    const session1End = new Date(tomorrow);
    session1End.setHours(12, 0, 0, 0);

    // Afternoon Session - 1 PM to 5 PM (within parent)
    const session2Start = new Date(tomorrow);
    session2Start.setHours(13, 0, 0, 0);
    const session2End = new Date(tomorrow);
    session2End.setHours(17, 0, 0, 0);

    // Team Meeting - 10 AM to 11 AM (overlaps with morning session for double-booking test)
    const meetingStart = new Date(tomorrow);
    meetingStart.setHours(10, 0, 0, 0);
    const meetingEnd = new Date(tomorrow);
    meetingEnd.setHours(11, 0, 0, 0);

    // Workshop - 2 PM to 4 PM (overlaps with afternoon session)
    const workshopStart = new Date(tomorrow);
    workshopStart.setHours(14, 0, 0, 0);
    const workshopEnd = new Date(tomorrow);
    workshopEnd.setHours(16, 0, 0, 0);

    // EventPro: Gala - 6 PM to 10 PM tomorrow
    const galaStart = new Date(tomorrow);
    galaStart.setHours(18, 0, 0, 0);
    const galaEnd = new Date(tomorrow);
    galaEnd.setHours(22, 0, 0, 0);

    // EventPro: Conference (parent) - 10 AM to 4 PM next week
    const epConfStart = new Date(nextWeek);
    epConfStart.setHours(10, 0, 0, 0);
    const epConfEnd = new Date(nextWeek);
    epConfEnd.setHours(16, 0, 0, 0);

    // EventPro: Child Session that VIOLATES parent boundary - 3 PM to 6 PM
    const epChildStart = new Date(nextWeek);
    epChildStart.setHours(15, 0, 0, 0);
    const epChildEnd = new Date(nextWeek);
    epChildEnd.setHours(18, 0, 0, 0); // VIOLATION: ends at 6 PM but parent ends at 4 PM

    // StartupHub: Pitch Day - all day next week
    const pitchStart = new Date(nextWeek);
    pitchStart.setHours(9, 0, 0, 0);
    const pitchEnd = new Date(nextWeek);
    pitchEnd.setHours(18, 0, 0, 0);

    // StartupHub: Networking Event
    const networkStart = new Date(nextWeek);
    networkStart.setHours(17, 0, 0, 0);
    const networkEnd = new Date(nextWeek);
    networkEnd.setHours(20, 0, 0, 0);

    // Insert parent events first (no parent_event_id)
    await queryRunner.query(
      `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW(), NOW())`,
      [techConf, 'Annual Tech Conference', 'Full-day technology conference', techConfStart.toISOString(), techConfEnd.toISOString(), 100, org1Id],
    );
    await queryRunner.query(
      `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW(), NOW())`,
      [gala, 'Evening Gala', 'Formal networking dinner', galaStart.toISOString(), galaEnd.toISOString(), 150, org2Id],
    );
    await queryRunner.query(
      `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW(), NOW())`,
      [eventProConf, 'EventPro Annual Summit', 'Industry summit for event professionals', epConfStart.toISOString(), epConfEnd.toISOString(), 80, org2Id],
    );
    await queryRunner.query(
      `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW(), NOW())`,
      [pitchDay, 'Startup Pitch Day', 'Pitch competition for startups', pitchStart.toISOString(), pitchEnd.toISOString(), 50, org3Id],
    );
    await queryRunner.query(
      `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW(), NOW())`,
      [networkEvent, 'Networking Mixer', 'Casual networking event', networkStart.toISOString(), networkEnd.toISOString(), 40, org3Id],
    );

    // Insert child events and standalone events
    await queryRunner.query(
      `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [techSession1, 'Morning Keynote Session', 'Opening keynotes and announcements', session1Start.toISOString(), session1End.toISOString(), 100, org1Id, techConf],
    );
    await queryRunner.query(
      `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [techSession2, 'Afternoon Workshops', 'Hands-on technical workshops', session2Start.toISOString(), session2End.toISOString(), 100, org1Id, techConf],
    );
    await queryRunner.query(
      `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW(), NOW())`,
      [techMeeting, 'Team Sync Meeting', 'Weekly team synchronization', meetingStart.toISOString(), meetingEnd.toISOString(), 20, org1Id],
    );
    await queryRunner.query(
      `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, NOW(), NOW())`,
      [techWorkshop, 'Deep Dive Workshop', 'Advanced technical workshop', workshopStart.toISOString(), workshopEnd.toISOString(), 30, org1Id],
    );
    // Child event that VIOLATES parent time boundary
    await queryRunner.query(
      `INSERT INTO events (id, name, description, start_time, end_time, capacity, organization_id, parent_event_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [eventProChild, 'Closing Panel - VIOLATION', 'Panel that exceeds parent time', epChildStart.toISOString(), epChildEnd.toISOString(), 80, org2Id, eventProConf],
    );

    // ============================================
    // 5. EVENT REGISTRATIONS (including double-bookings)
    // ============================================
    console.log('Creating registrations...');

    // Alice: Double-booked - registered for both morning session AND team meeting (overlapping!)
    await queryRunner.query(
      `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), techSession1, user1Id],
    );
    await queryRunner.query(
      `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), techMeeting, user1Id],
    );

    // Bob: Double-booked - afternoon session + workshop
    await queryRunner.query(
      `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW(), NOW())`,
      [uuidv4(), techSession2, user2Id],
    );
    await queryRunner.query(
      `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), techWorkshop, user2Id],
    );

    // Carol: normal registration
    await queryRunner.query(
      `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW(), NOW())`,
      [uuidv4(), techSession1, user3Id],
    );

    // David and Eva: EventPro registrations
    await queryRunner.query(
      `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW(), NOW())`,
      [uuidv4(), gala, user4Id],
    );
    await queryRunner.query(
      `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), gala, user5Id],
    );

    // Frank: StartupHub registration
    await queryRunner.query(
      `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW(), NOW())`,
      [uuidv4(), pitchDay, user6Id],
    );

    // External attendees - Gala has many (threshold violation test)
    const externalEmails = [
      'external1@gmail.com', 'external2@gmail.com', 'external3@yahoo.com',
      'external4@hotmail.com', 'external5@company.com', 'external6@business.org',
    ];
    for (const email of externalEmails) {
      await queryRunner.query(
        `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
         VALUES ($1, $2, NULL, $3, NULL, NOW(), NOW(), NOW())`,
        [uuidv4(), gala, email],
      );
    }

    // Pitch day external attendees
    await queryRunner.query(
      `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
       VALUES ($1, $2, NULL, $3, NOW(), NOW(), NOW(), NOW())`,
      [uuidv4(), pitchDay, 'investor1@vc.com'],
    );
    await queryRunner.query(
      `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
       VALUES ($1, $2, NULL, $3, NOW(), NOW(), NOW(), NOW())`,
      [uuidv4(), pitchDay, 'investor2@vc.com'],
    );

    // Tech conference external attendees
    const techExternals = ['speaker1@tech.com', 'speaker2@tech.com', 'sponsor1@bigtech.com', 'sponsor2@bigtech.com'];
    for (const email of techExternals) {
      await queryRunner.query(
        `INSERT INTO event_registrations (id, event_id, user_id, external_email, checkin_time, registered_at, created_at, updated_at)
         VALUES ($1, $2, NULL, $3, NULL, NOW(), NOW(), NOW())`,
        [uuidv4(), techConf, email],
      );
    }

    // ============================================
    // 6. RESOURCE ALLOCATIONS (including violations)
    // ============================================
    console.log('Creating resource allocations...');

    // VIOLATION: Conference Room A allocated to both morning session AND team meeting (overlapping!)
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), techSession1, room1Id],
    );
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), techMeeting, room1Id],
    );

    // Normal: Conference Room B for afternoon session
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), techSession2, room2Id],
    );

    // VIOLATION: Shareable projector over-allocated (max 3, allocating 4 overlapping events)
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), techSession1, projector1Id],
    );
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), techMeeting, projector1Id],
    );
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), techSession2, projector1Id],
    );
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), techWorkshop, projector1Id],
    );

    // VIOLATION: Consumable laptops - allocate more than available (15 available, allocating 18)
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
      [uuidv4(), techSession1, laptops1Id, 10],
    );
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
      [uuidv4(), techSession2, laptops1Id, 8],
    );

    // Global resource allocations across organizations
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), gala, globalProjectorId],
    );
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), pitchDay, globalProjectorId],
    );

    // VIOLATION: Global printed materials over-consumed (100 available, allocating 110)
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
      [uuidv4(), gala, globalPrintedId, 60],
    );
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
      [uuidv4(), pitchDay, globalPrintedId, 50],
    );

    // EventPro allocations
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), gala, hallId],
    );
    await queryRunner.query(
      `INSERT INTO resource_allocations (id, event_id, resource_id, quantity_used, allocated_at, created_at, updated_at)
       VALUES ($1, $2, $3, NULL, NOW(), NOW(), NOW())`,
      [uuidv4(), gala, mics1Id],
    );

    await queryRunner.commitTransaction();

    console.log('\nDatabase seeded successfully!\n');
    console.log('Seed Summary:');
    console.log('   - 3 Organizations');
    console.log('   - 7 Users across organizations');
    console.log('   - 8 Resources (6 org-specific + 2 global)');
    console.log('   - 10 Events (including parent-child relationships)');
    console.log('   - Multiple registrations (including double-bookings)');
    console.log('   - Multiple allocations (including violations)');
    console.log('\nTest Violations Included:');
    console.log('   - Double-booked users (Alice, Bob)');
    console.log('   - Exclusive resource conflict (Conference Room A)');
    console.log('   - Shareable resource over-allocation (Projector Set)');
    console.log('   - Consumable resource exceeded (Laptop Pool, Printed Materials)');
    console.log('   - Parent-child time boundary violation (Closing Panel)');
    console.log('   - Events with many external attendees (Gala - 6 externals)');
  } catch (error) {
    console.error('Seed failed:', error);
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
