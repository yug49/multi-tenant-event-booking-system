# Database Schema Documentation

This document describes the PostgreSQL database schema for the Multi-Tenant Event Booking System.

## Tables

### organizations

Stores tenant organizations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| name | varchar(255) | NOT NULL | Organization name |
| description | varchar(500) | | Optional description |
| created_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### users

Stores users belonging to organizations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| email | varchar(255) | NOT NULL, UNIQUE | User email |
| name | varchar(255) | NOT NULL | Display name |
| password_hash | varchar(255) | NOT NULL | Hashed password |
| organization_id | uuid | NOT NULL, FK organizations(id) ON DELETE CASCADE | User's organization |
| created_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Indexes:**
- `idx_users_organization` on (organization_id)

### resources

Stores bookable resources with three types: EXCLUSIVE, SHAREABLE, and CONSUMABLE.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| name | varchar(255) | NOT NULL | Resource name |
| description | varchar(500) | | Optional description |
| type | varchar(20) | NOT NULL, CHECK (type IN ('EXCLUSIVE', 'SHAREABLE', 'CONSUMABLE')) | Resource type |
| organization_id | uuid | FK organizations(id) ON DELETE CASCADE | Owner organization (null for global) |
| is_global | boolean | DEFAULT false | Whether resource is shared across orgs |
| max_concurrent_usage | integer | Required if SHAREABLE | Max simultaneous allocations |
| available_quantity | integer | Required if CONSUMABLE | Total available quantity |
| created_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Check Constraints:**
- `chk_resource_type`: Type must be EXCLUSIVE, SHAREABLE, or CONSUMABLE
- `chk_global_no_org`: Global resources must have null organization_id
- `chk_shareable_max_usage`: SHAREABLE resources must have max_concurrent_usage
- `chk_consumable_quantity`: CONSUMABLE resources must have available_quantity

**Indexes:**
- `idx_resources_organization` on (organization_id)

### events

Stores events with optional parent-child relationships for multi-session events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| name | varchar(255) | NOT NULL | Event name |
| description | varchar(1000) | | Optional description |
| start_time | timestamp with time zone | NOT NULL | Event start |
| end_time | timestamp with time zone | NOT NULL | Event end |
| capacity | integer | NOT NULL | Maximum attendees |
| organization_id | uuid | NOT NULL, FK organizations(id) ON DELETE CASCADE | Event owner |
| parent_event_id | uuid | FK events(id) ON DELETE CASCADE | Parent event (for sessions) |
| created_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Check Constraints:**
- `chk_event_time_valid`: end_time must be greater than start_time

**Indexes:**
- `idx_events_organization` on (organization_id)
- `idx_events_time_range` on (start_time, end_time)
- `idx_events_parent` on (parent_event_id)

### event_registrations

Stores event attendee registrations for both users and external attendees.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| event_id | uuid | NOT NULL, FK events(id) ON DELETE CASCADE | Target event |
| user_id | uuid | FK users(id) ON DELETE CASCADE | Registered user (null for external) |
| external_email | varchar(255) | | External attendee email |
| checkin_time | timestamp with time zone | | Check-in timestamp |
| registered_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |
| created_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Constraints:**
- `uq_registration_event_user`: UNIQUE (event_id, user_id)
- `chk_user_or_external`: Either user_id OR external_email must be set, not both

**Indexes:**
- `idx_registrations_event` on (event_id)
- `idx_registrations_user` on (user_id)

### resource_allocations

Stores resource allocations to events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier |
| event_id | uuid | NOT NULL, FK events(id) ON DELETE CASCADE | Target event |
| resource_id | uuid | NOT NULL, FK resources(id) ON DELETE CASCADE | Allocated resource |
| quantity_used | integer | | Quantity (for consumables) |
| allocated_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Allocation timestamp |
| created_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

**Constraints:**
- `uq_allocation_event_resource`: UNIQUE (event_id, resource_id)
- `chk_quantity_positive`: quantity_used must be positive if set

**Indexes:**
- `idx_allocations_event` on (event_id)
- `idx_allocations_resource` on (resource_id)

## Materialized View

### mv_resource_utilization

Precomputed resource utilization metrics for performance.

| Column | Type | Description |
|--------|------|-------------|
| resource_id | uuid | Resource identifier |
| resource_name | varchar | Resource name |
| resource_type | varchar | Resource type |
| organization_id | uuid | Owner organization |
| is_global | boolean | Global resource flag |
| total_allocations | integer | Count of allocations |
| total_hours_used | numeric | Sum of allocated hours |
| total_quantity_consumed | integer | Sum of quantity used |

**Indexes:**
- `idx_mv_resource_utilization_resource` UNIQUE on (resource_id)

Refresh with: `REFRESH MATERIALIZED VIEW mv_resource_utilization`

## Entity Relationships

```
organizations
    |
    +-- users (many)
    |
    +-- events (many)
    |       |
    |       +-- events (children, self-reference)
    |       |
    |       +-- event_registrations (many)
    |       |
    |       +-- resource_allocations (many)
    |
    +-- resources (many, or null for global)
            |
            +-- resource_allocations (many)
```

## Key Business Rules Enforced by Schema

1. Users belong to exactly one organization
2. Events must have valid time ranges (end > start)
3. Resources have type-specific required fields
4. Global resources cannot have an organization
5. Registrations are either for a user OR external email, never both
6. Each user can register once per event
7. Each resource can be allocated once per event
8. Cascading deletes maintain referential integrity
