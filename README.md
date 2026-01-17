# Multi-Tenant Event Booking System

A multi-tenant event booking platform where organizations can manage events, attendees, and shared resources with complex scheduling and allocation constraints.

## Tech Stack

- Backend: NestJS with TypeORM
- Database: PostgreSQL
- Frontend: React with Vite and TailwindCSS

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd multi-tenant-event-booking-system

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create a `.env` file in the backend folder:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=event_booking
```

### 3. Setup Database

Create the database and run migrations:

```bash
# Create database
createdb event_booking

# Run migrations
cd backend
npm run migration:run
```

### 4. Seed Test Data (Optional)

```bash
cd backend
npm run seed
```

This creates sample organizations, users, events, resources, and registrations with some intentional constraint violations for testing reports.

### 5. Start the Application

```bash
# Start backend (runs on http://localhost:3000)
cd backend
npm run start:dev

# In another terminal, start frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

## Project Structure

```
backend/
  src/
    common/          # Shared entities, enums, filters
    database/        # Migrations and seed script
    modules/         # Feature modules
      organizations/ # Organization management
      users/         # User management
      events/        # Event CRUD and scheduling
      resources/     # Resource management
      registrations/ # Attendee registrations
      allocations/   # Resource allocations
      reports/       # Analytics and violation reports
    main.ts          # Application entry point

frontend/
  src/
    components/      # Reusable UI components
    context/         # React context providers
    pages/           # Page components
    services/        # API service layer

docs/
  API.md            # API endpoint documentation
  DATABASE.md       # Database schema documentation
```

## Features

### Multi-Tenant Structure
- Users belong to one organization
- Events and resources are scoped to organizations
- Global resources can be shared across organizations

### Event Management
- Create events with time ranges and capacity limits
- Support for parent-child events (multi-session conferences)
- Register internal users or external attendees by email
- Track attendance with check-in timestamps

### Resource Allocation
- Exclusive: Cannot be double-booked in overlapping time slots
- Shareable: Have concurrent usage limits
- Consumable: Track quantity used per event

### Reports (Raw SQL)
- Double-booked users across overlapping events
- Resource constraint violations by type
- Resource utilization metrics with materialized view
- Parent-child time boundary violations
- External attendee counts

## Documentation

- [API Documentation](docs/API.md): Complete endpoint reference
- [Database Schema](docs/DATABASE.md): Table definitions and constraints

## Development

### Running Migrations

```bash
cd backend
npm run migration:run
```

### Reverting Migrations

```bash
cd backend
npm run migration:revert
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
```

## License

MIT
