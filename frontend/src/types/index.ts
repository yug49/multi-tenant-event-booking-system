// Organization Types
export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  createdAt: string;
}

// Resource Types
export enum ResourceType {
  EXCLUSIVE = 'EXCLUSIVE',
  SHAREABLE = 'SHAREABLE',
  CONSUMABLE = 'CONSUMABLE',
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  type: ResourceType;
  organizationId: string | null;
  isGlobal: boolean;
  maxConcurrentUsage: number | null;
  availableQuantity: number | null;
  createdAt: string;
}

// Event Types
export interface Event {
  id: string;
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  capacity: number;
  organizationId: string;
  parentEventId: string | null;
  createdAt: string;
}

// Registration Types
export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string | null;
  externalEmail: string | null;
  checkinTime: string | null;
  registeredAt: string;
}

// Resource Allocation Types
export interface ResourceAllocation {
  id: string;
  eventId: string;
  resourceId: string;
  quantityUsed: number | null;
  allocatedAt: string;
}

// Report Types
export interface DoubleBookedUser {
  userId: string;
  userName: string;
  conflictingEvents: { eventId: string; eventName: string }[];
}

export interface ResourceViolation {
  resourceId: string;
  resourceName: string;
  violationType: 'EXCLUSIVE_OVERLAP' | 'SHAREABLE_EXCEEDED' | 'CONSUMABLE_EXCEEDED';
  events: { eventId: string; eventName: string }[];
}

export interface ResourceUtilization {
  resourceId: string;
  resourceName: string;
  organizationId: string;
  totalHoursUsed: number;
  peakConcurrentUsage: number;
}

export interface ParentChildViolation {
  parentEventId: string;
  parentEventName: string;
  childEventId: string;
  childEventName: string;
  violationReason: string;
}
