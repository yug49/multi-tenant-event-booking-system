import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Modal, Input, Select, Table, Badge, Alert, SkeletonTable } from '../components/ui';
import type { Event, User, EventRegistration } from '../types';
import { eventService, userService, registrationService } from '../services';
import { useOrganization } from '../context';

interface AttendeeRow extends EventRegistration {
  eventName: string;
  userName: string | null;
}

export default function Attendees() {
  const { selectedOrganization } = useOrganization();
  const [attendees, setAttendees] = useState<AttendeeRow[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [formData, setFormData] = useState({
    eventId: '',
    userId: '',
    externalEmail: '',
  });

  const fetchData = useCallback(async () => {
    if (!selectedOrganization) return;
    try {
      setIsLoading(true);
      setError(null);
      const [eventsRes, usersRes] = await Promise.all([
        eventService.getAll(),
        userService.getAll(),
      ]);
      const orgEvents = eventsRes.data.filter(
        (e) => e.organizationId === selectedOrganization.id
      );
      const orgUsers = usersRes.data.filter(
        (u) => u.organizationId === selectedOrganization.id
      );
      setEvents(orgEvents);
      setUsers(orgUsers);

      // Fetch registrations for all events
      const allAttendees: AttendeeRow[] = [];
      for (const event of orgEvents) {
        try {
          const regRes = await registrationService.getByEvent(event.id);
          const eventAttendees = regRes.data.map((reg) => ({
            ...reg,
            eventName: event.name,
            userName: reg.userId
              ? orgUsers.find((u) => u.id === reg.userId)?.name || 'Unknown User'
              : null,
          }));
          allAttendees.push(...eventAttendees);
        } catch {
          // Event might have no registrations
        }
      }
      setAttendees(allAttendees);
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrationService.registerUser({
        eventId: formData.eventId,
        userId: formData.userId,
      });
      setIsRegisterModalOpen(false);
      setFormData({ eventId: '', userId: '', externalEmail: '' });
      fetchData();
    } catch (err: any) {
      const message = err.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : message || 'Failed to register user';
      setError(errorMsg);
    }
  };

  const handleExternalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrationService.registerExternal({
        eventId: formData.eventId,
        externalEmail: formData.externalEmail,
      });
      setIsExternalModalOpen(false);
      setFormData({ eventId: '', userId: '', externalEmail: '' });
      fetchData();
    } catch (err: any) {
      const message = err.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : message || 'Failed to register external attendee';
      setError(errorMsg);
    }
  };

  const handleCheckin = async (attendee: AttendeeRow) => {
    try {
      await registrationService.checkin(attendee.id);
      fetchData();
    } catch (err: any) {
      const message = err.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : message || 'Failed to check in';
      setError(errorMsg);
    }
  };

  const handleCancel = async (attendee: AttendeeRow) => {
    if (!confirm('Are you sure you want to cancel this registration?')) return;
    try {
      await registrationService.cancel(attendee.id);
      fetchData();
    } catch (err: any) {
      const message = err.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : message || 'Failed to cancel registration';
      setError(errorMsg);
    }
  };

  const filteredAttendees = selectedEvent
    ? attendees.filter((a) => a.eventId === selectedEvent)
    : attendees;

  const columns = [
    {
      key: 'attendee',
      header: 'Attendee',
      render: (attendee: AttendeeRow) => (
        <div>
          <div className="font-medium text-gray-900">
            {attendee.userName || attendee.externalEmail}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {attendee.userId ? 'Member' : 'External Guest'}
          </div>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      render: (attendee: AttendeeRow) => (
        <span className="text-sm">{attendee.eventName}</span>
      ),
    },
    {
      key: 'registered',
      header: 'Registered',
      render: (attendee: AttendeeRow) => (
        <span className="text-sm text-gray-600">{formatDate(attendee.registeredAt)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (attendee: AttendeeRow) => (
        <Badge variant={attendee.checkinTime ? 'success' : 'default'}>
          {attendee.checkinTime ? 'Checked In' : 'Registered'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (attendee: AttendeeRow) => (
        <div className="flex gap-1 justify-end">
          {!attendee.checkinTime && (
            <Button variant="primary" size="sm" onClick={() => handleCheckin(attendee)}>
              Check In
            </Button>
          )}
          {attendee.checkinTime && (
            <span className="text-xs text-gray-500">
              {formatDate(attendee.checkinTime)}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => handleCancel(attendee)}>
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  const totalAttendees = filteredAttendees.length;
  const checkedIn = filteredAttendees.filter((a) => a.checkinTime).length;
  const external = filteredAttendees.filter((a) => !a.userId).length;

  if (!selectedOrganization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select an organization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Attendees</h1>
          <p className="text-sm text-gray-500 mt-1">Manage registrations and track attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsExternalModalOpen(true)}>
            Add External
          </Button>
          <Button onClick={() => setIsRegisterModalOpen(true)}>Register User</Button>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-gray-500">Total:</span>{' '}
            <span className="font-medium text-gray-900">{totalAttendees}</span>
          </div>
          <div>
            <span className="text-gray-500">Checked In:</span>{' '}
            <span className="font-medium text-emerald-600">{checkedIn}</span>
          </div>
          <div>
            <span className="text-gray-500">External:</span>{' '}
            <span className="font-medium text-gray-900">{external}</span>
          </div>
        </div>
        <Select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          options={[
            { value: '', label: 'All Events' },
            ...events.map((e) => ({ value: e.id, label: e.name })),
          ]}
          className="w-48"
        />
      </div>

      <Card padding="none">
        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : (
          <Table
            columns={columns}
            data={filteredAttendees}
            keyExtractor={(attendee) => attendee.id}
            emptyMessage="No attendees registered yet"
          />
        )}
      </Card>

      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRegister}>Register</Button>
          </>
        }
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <Select
            label="Select Event"
            placeholder="Choose an event"
            value={formData.eventId}
            onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
            options={events.map((e) => ({ value: e.id, label: e.name }))}
            required
          />
          <Select
            label="Select User"
            placeholder="Choose a user"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            options={users.map((u) => ({ value: u.id, label: u.name }))}
            required
          />
          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600">
            <p>The user will be registered for this event and can check in on the event day.</p>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isExternalModalOpen}
        onClose={() => setIsExternalModalOpen(false)}
        title="Add External Attendee"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsExternalModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExternalRegister}>Add Attendee</Button>
          </>
        }
      >
        <form onSubmit={handleExternalRegister} className="space-y-4">
          <Select
            label="Select Event"
            placeholder="Choose an event"
            value={formData.eventId}
            onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
            options={events.map((e) => ({ value: e.id, label: e.name }))}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="guest@example.com"
            value={formData.externalEmail}
            onChange={(e) => setFormData({ ...formData, externalEmail: e.target.value })}
            required
          />
          <div className="p-3 bg-amber-50 rounded-md text-sm text-amber-800">
            <p>External attendees don't have a user account. They will be tracked by email only.</p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
