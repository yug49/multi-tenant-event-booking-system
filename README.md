# Multi-Tenant Event Booking System

A multi-tenant event booking platform where organizations can manage events, attendees, and shared resources with complex scheduling and allocation constraints.

## Project Structure

```
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── hooks/         # Custom React hooks
│   │   ├── context/       # React context providers
│   │   └── types/         # TypeScript type definitions
│   └── ...
│
├── backend/           # NestJS + TypeORM + PostgreSQL
│   ├── src/
│   │   ├── modules/       # Feature modules
│   │   │   ├── organizations/
│   │   │   ├── users/
│   │   │   ├── events/
│   │   │   ├── resources/
│   │   │   ├── registrations/
│   │   │   ├── allocations/
│   │   │   └── reports/
│   │   ├── common/        # Shared utilities
│   │   └── database/      # Database configurations
│   └── ...
└── ...
```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yug49/multi-tenant-event-booking-system.git
cd multi-tenant-event-booking-system
```

### 2. Database Setup

Create a PostgreSQL database:

```bash
createdb event_booking
```

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm run start:dev
```

The API will be available at `http://localhost:4000/api`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios
- TailwindCSS

### Backend
- NestJS
- TypeORM
- PostgreSQL
- Class Validator

## Features

- **Multi-tenant architecture**: Organizations can manage their own events and resources
- **Event management**: Create events with parent-child relationships for multi-session events
- **Resource allocation**: Support for exclusive, shareable, and consumable resources
- **Attendee management**: Register users and external attendees with check-in tracking
- **Reporting**: Complex SQL queries for utilization and constraint violation detection

## API Endpoints

| Module | Endpoint | Description |
|--------|----------|-------------|
| Organizations | `/api/organizations` | CRUD for organizations |
| Users | `/api/users` | CRUD for users |
| Events | `/api/events` | CRUD for events |
| Resources | `/api/resources` | CRUD for resources |
| Registrations | `/api/events/:id/registrations` | Event registrations |
| Allocations | `/api/events/:id/allocations` | Resource allocations |
| Reports | `/api/reports/*` | Various reports |

## License

MIT
