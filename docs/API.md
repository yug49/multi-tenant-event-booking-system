# API Documentation

This document describes all available REST API endpoints for the Multi-Tenant Event Booking System.

Base URL: `http://localhost:3000/api`

## Organizations

### Create Organization
- **POST** `/organizations`
- **Body:** `{ "name": string, "description"?: string }`
- **Response:** Created organization object

### List Organizations
- **GET** `/organizations`
- **Response:** Array of organization objects

### Get Organization
- **GET** `/organizations/:id`
- **Response:** Organization object

### Update Organization
- **PUT** `/organizations/:id`
- **Body:** `{ "name"?: string, "description"?: string }`
- **Response:** Updated organization object

### Delete Organization
- **DELETE** `/organizations/:id`
- **Response:** Success confirmation

## Users

### Create User
- **POST** `/users`
- **Body:** `{ "email": string, "name": string, "password": string, "organizationId": string }`
- **Response:** Created user object (password excluded)

### List Users
- **GET** `/users`
- **Query:** `organizationId` (required)
- **Response:** Array of user objects

### Get User
- **GET** `/users/:id`
- **Response:** User object

### Update User
- **PUT** `/users/:id`
- **Body:** `{ "email"?: string, "name"?: string, "password"?: string }`
- **Response:** Updated user object

### Delete User
- **DELETE** `/users/:id`
- **Response:** Success confirmation

## Events

### Create Event
- **POST** `/events`
- **Body:** 
  ```json
  {
    "name": string,
    "description"?: string,
    "startTime": ISO8601 datetime,
    "endTime": ISO8601 datetime,
    "capacity": number,
    "organizationId": string,
    "parentEventId"?: string
  }
  ```
- **Response:** Created event object

### List Events
- **GET** `/events`
- **Query:** 
  - `organizationId` (required)
  - `parentOnly` (optional, boolean): Filter to only parent events
- **Response:** Array of event objects

### Get Event
- **GET** `/events/:id`
- **Response:** Event object with organization details

### Get Child Events
- **GET** `/events/:id/children`
- **Response:** Array of child session events

### Update Event
- **PUT** `/events/:id`
- **Body:** Same as create, all fields optional
- **Response:** Updated event object

### Delete Event
- **DELETE** `/events/:id`
- **Response:** Success confirmation

## Resources

### Create Resource
- **POST** `/resources`
- **Body:**
  ```json
  {
    "name": string,
    "description"?: string,
    "type": "EXCLUSIVE" | "SHAREABLE" | "CONSUMABLE",
    "organizationId"?: string,
    "isGlobal"?: boolean,
    "maxConcurrentUsage"?: number,
    "availableQuantity"?: number
  }
  ```
- **Response:** Created resource object
- **Notes:** 
  - SHAREABLE resources require `maxConcurrentUsage`
  - CONSUMABLE resources require `availableQuantity`
  - Global resources must have `organizationId` as null

### List Resources
- **GET** `/resources`
- **Query:** `organizationId` (required). Returns organization resources plus global resources.
- **Response:** Array of resource objects

### Get Resource
- **GET** `/resources/:id`
- **Response:** Resource object

### Update Resource
- **PUT** `/resources/:id`
- **Body:** Same as create, all fields optional
- **Response:** Updated resource object

### Delete Resource
- **DELETE** `/resources/:id`
- **Response:** Success confirmation

## Registrations

### Register User
- **POST** `/registrations/user`
- **Body:** `{ "eventId": string, "userId": string }`
- **Response:** Created registration object

### Register External Attendee
- **POST** `/registrations/external`
- **Body:** `{ "eventId": string, "externalEmail": string }`
- **Response:** Created registration object

### Check In
- **POST** `/registrations/:id/checkin`
- **Response:** Updated registration with checkin timestamp

### List Registrations
- **GET** `/registrations`
- **Query:** `eventId` (required)
- **Response:** Array of registration objects with user details

### Get Registration
- **GET** `/registrations/:id`
- **Response:** Registration object

### Cancel Registration
- **DELETE** `/registrations/:id`
- **Response:** Success confirmation

## Allocations

### Create Allocation
- **POST** `/allocations`
- **Body:** `{ "eventId": string, "resourceId": string, "quantityUsed"?: number }`
- **Response:** Created allocation object
- **Notes:** `quantityUsed` is required for CONSUMABLE resources

### List Allocations
- **GET** `/allocations`
- **Query:** `eventId` (required)
- **Response:** Array of allocation objects with resource details

### List Allocations by Resource
- **GET** `/allocations/resource/:resourceId`
- **Response:** Array of allocation objects with event details

### Get Allocation
- **GET** `/allocations/:id`
- **Response:** Allocation object

### Delete Allocation
- **DELETE** `/allocations/:id`
- **Response:** Success confirmation

## Reports

All report endpoints use raw SQL queries for complex analytics.

### Double-Booked Users
- **GET** `/reports/double-booked-users`
- **Response:** Users registered for overlapping events

### Resource Violations
- **GET** `/reports/resource-violations`
- **Response:** All constraint violations (exclusive, shareable, consumable)

### Shareable Resource Violations
- **GET** `/reports/resource-violations/shareable`
- **Response:** Resources exceeding max concurrent usage

### Exclusive Resource Violations
- **GET** `/reports/resource-violations/exclusive`
- **Response:** Exclusive resources double-booked in overlapping events

### Consumable Resource Violations
- **GET** `/reports/resource-violations/consumable`
- **Response:** Consumables with quantity exceeding availability

### Resource Utilization
- **GET** `/reports/resource-utilization`
- **Query:** `organizationId` (optional)
- **Response:** Usage metrics per resource

### Peak Concurrent Usage
- **GET** `/reports/peak-concurrent-usage`
- **Response:** Peak usage statistics for shareable resources

### Parent-Child Time Violations
- **GET** `/reports/parent-child-violations`
- **Response:** Child events that fall outside parent event boundaries

### External Attendees
- **GET** `/reports/external-attendees`
- **Query:** `threshold` (optional, default: 5)
- **Response:** Events with external attendee count above threshold

### Refresh Utilization View
- **POST** `/reports/refresh-utilization-view`
- **Response:** Success confirmation
- **Notes:** Refreshes the materialized view for resource utilization

### Get Utilization View
- **GET** `/reports/utilization-view`
- **Response:** Data from the materialized view

## Error Responses

All errors follow a consistent format:

```json
{
  "statusCode": number,
  "message": string | string[],
  "error": string,
  "timestamp": ISO8601 datetime,
  "path": string
}
```

Common status codes:
- 400: Bad Request (validation errors)
- 404: Not Found
- 409: Conflict (constraint violation)
- 500: Internal Server Error
