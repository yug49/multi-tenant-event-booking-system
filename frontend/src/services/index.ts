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
  getAll: (organizationId?: string) => 
    api.get<User[]>(`/users${organizationId ? `?organizationId=${organizationId}` : ''}`),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) => api.post<User>('/users', data),
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
  getByEvent: (eventId: string) => api.get<EventRegistration[]>(`/registrations?eventId=${eventId}`),
  registerUser: (data: { eventId: string; userId: string }) =>
    api.post<EventRegistration>('/registrations/user', data),
  registerExternal: (data: { eventId: string; externalEmail: string }) =>
    api.post<EventRegistration>('/registrations/external', data),
  checkin: (id: string) => api.post<EventRegistration>(`/registrations/${id}/checkin`),
  cancel: (id: string) => api.delete(`/registrations/${id}`),
};

// Resource Allocations
export const allocationService = {
  getByEvent: (eventId: string) => api.get<ResourceAllocation[]>(`/allocations?eventId=${eventId}`),
  getByResource: (resourceId: string) => api.get<ResourceAllocation[]>(`/allocations/resource/${resourceId}`),
  create: (data: { eventId: string; resourceId: string; quantityUsed?: number }) =>
    api.post<ResourceAllocation>('/allocations', data),
  delete: (id: string) => api.delete(`/allocations/${id}`),
};

// Reports
export const reportService = {
  getDoubleBookedUsers: (organizationId?: string) => 
    api.get(`/reports/double-booked-users${organizationId ? `?organizationId=${organizationId}` : ''}`),
  getResourceViolations: (organizationId?: string) => 
    api.get(`/reports/resource-violations${organizationId ? `?organizationId=${organizationId}` : ''}`),
  getResourceUtilization: (organizationId?: string) => 
    api.get(`/reports/resource-utilization${organizationId ? `?organizationId=${organizationId}` : ''}`),
  getPeakConcurrentUsage: () => api.get('/reports/peak-concurrent-usage'),
  getParentChildViolations: (organizationId?: string) =>
    api.get(`/reports/parent-child-violations${organizationId ? `?organizationId=${organizationId}` : ''}`),
  getExternalAttendeeReport: (threshold: number, organizationId?: string) =>
    api.get(`/reports/external-attendees?threshold=${threshold}${organizationId ? `&organizationId=${organizationId}` : ''}`),
  refreshUtilizationView: () => api.post('/reports/refresh-utilization-view'),
};
