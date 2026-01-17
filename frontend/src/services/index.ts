import api from './api';
import type { Organization, User, Event, Resource, EventRegistration, ResourceAllocation } from '../types';

// Organizations
export const organizationService = {
  getAll: () => api.get<Organization[]>('/organizations'),
  getById: (id: string) => api.get<Organization>(`/organizations/${id}`),
  create: (data: Partial<Organization>) => api.post<Organization>('/organizations', data),
  update: (id: string, data: Partial<Organization>) => api.put<Organization>(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
};

// Users
export const userService = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Events
export const eventService = {
  getAll: () => api.get<Event[]>('/events'),
  getById: (id: string) => api.get<Event>(`/events/${id}`),
  create: (data: Partial<Event>) => api.post<Event>('/events', data),
  update: (id: string, data: Partial<Event>) => api.put<Event>(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  getChildren: (parentId: string) => api.get<Event[]>(`/events/${parentId}/children`),
};

// Resources
export const resourceService = {
  getAll: () => api.get<Resource[]>('/resources'),
  getById: (id: string) => api.get<Resource>(`/resources/${id}`),
  create: (data: Partial<Resource>) => api.post<Resource>('/resources', data),
  update: (id: string, data: Partial<Resource>) => api.put<Resource>(`/resources/${id}`, data),
  delete: (id: string) => api.delete(`/resources/${id}`),
};

// Event Registrations
export const registrationService = {
  getByEvent: (eventId: string) => api.get<EventRegistration[]>(`/events/${eventId}/registrations`),
  register: (eventId: string, data: { userId?: string; externalEmail?: string }) =>
    api.post<EventRegistration>(`/events/${eventId}/registrations`, data),
  checkin: (eventId: string, registrationId: string) =>
    api.patch<EventRegistration>(`/events/${eventId}/registrations/${registrationId}/checkin`),
  cancel: (eventId: string, registrationId: string) =>
    api.delete(`/events/${eventId}/registrations/${registrationId}`),
};

// Resource Allocations
export const allocationService = {
  getByEvent: (eventId: string) => api.get<ResourceAllocation[]>(`/events/${eventId}/allocations`),
  allocate: (eventId: string, data: { resourceId: string; quantityUsed?: number }) =>
    api.post<ResourceAllocation>(`/events/${eventId}/allocations`, data),
  deallocate: (eventId: string, allocationId: string) =>
    api.delete(`/events/${eventId}/allocations/${allocationId}`),
};

// Reports
export const reportService = {
  getDoubleBookedUsers: () => api.get('/reports/double-booked-users'),
  getResourceViolations: () => api.get('/reports/resource-violations'),
  getResourceUtilization: () => api.get('/reports/resource-utilization'),
  getParentChildViolations: () => api.get('/reports/parent-child-violations'),
  getExternalAttendeeReport: (threshold: number) =>
    api.get(`/reports/external-attendees?threshold=${threshold}`),
};
