import { useState } from 'react';
import { Button, Card, Modal, Input, Select, Table, Badge } from '../components/ui';

interface Attendee {
  id: string;
  eventId: string;
  eventName: string;
  userId: string | null;
  userName: string | null;
  externalEmail: string | null;
  checkinTime: string | null;
  registeredAt: string;
}

// Mock data for development
const MOCK_ATTENDEES: Attendee[] = [
  {
    id: '1',
    eventId: '1',
    eventName: 'Annual Tech Conference',
    userId: '1',
    userName: 'John Smith',
    externalEmail: null,
    checkinTime: '2026-02-15T08:45:00Z',
    registeredAt: '2026-01-10T14:30:00Z',
  },
  {
    id: '2',
    eventId: '1',
    eventName: 'Annual Tech Conference',
    userId: '2',
    userName: 'Sarah Johnson',
    externalEmail: null,
    checkinTime: null,
    registeredAt: '2026-01-12T09:15:00Z',
  },
  {
    id: '3',
    eventId: '1',
    eventName: 'Annual Tech Conference',
    userId: null,
    userName: null,
    externalEmail: 'guest@external.com',
    checkinTime: null,
    registeredAt: '2026-01-15T11:20:00Z',
  },
  {
    id: '4',
    eventId: '2',
    eventName: 'Opening Keynote',
    userId: '1',
    userName: 'John Smith',
    externalEmail: null,
    checkinTime: '2026-02-15T08:50:00Z',
    registeredAt: '2026-01-10T14:35:00Z',
  },
  {
    id: '5',
    eventId: '3',
    eventName: 'Workshop: Cloud Architecture',
    userId: null,
    userName: null,
    externalEmail: 'external.partner@company.org',
    checkinTime: null,
    registeredAt: '2026-01-18T16:00:00Z',
  },
];

const MOCK_EVENTS = [
  { value: '1', label: 'Annual Tech Conference' },
  { value: '2', label: 'Opening Keynote' },
  { value: '3', label: 'Workshop: Cloud Architecture' },
  { value: '4', label: 'Team Building Session' },
];

const MOCK_USERS = [
  { value: '1', label: 'John Smith' },
  { value: '2', label: 'Sarah Johnson' },
  { value: '3', label: 'Mike Wilson' },
];

export default function Attendees() {
  const [attendees] = useState<Attendee[]>(MOCK_ATTENDEES);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [formData, setFormData] = useState({
    eventId: '',
    userId: '',
    externalEmail: '',
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAttendees = selectedEvent
    ? attendees.filter((a) => a.eventId === selectedEvent)
    : attendees;

  const columns = [
    {
      key: 'attendee',
      header: 'Attendee',
      render: (attendee: Attendee) => (
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
      render: (attendee: Attendee) => (
        <span className="text-sm">{attendee.eventName}</span>
      ),
    },
    {
      key: 'registered',
      header: 'Registered',
      render: (attendee: Attendee) => (
        <span className="text-sm text-gray-600">{formatDate(attendee.registeredAt)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (attendee: Attendee) => (
        <Badge variant={attendee.checkinTime ? 'success' : 'default'}>
          {attendee.checkinTime ? 'Checked In' : 'Registered'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (attendee: Attendee) => (
        <div className="flex gap-1 justify-end">
          {!attendee.checkinTime && (
            <Button variant="primary" size="sm">
              Check In
            </Button>
          )}
          {attendee.checkinTime && (
            <span className="text-xs text-gray-500">
              {formatDate(attendee.checkinTime)}
            </span>
          )}
        </div>
      ),
    },
  ];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register user:', formData);
    setIsRegisterModalOpen(false);
    setFormData({ eventId: '', userId: '', externalEmail: '' });
  };

  const handleExternalRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register external:', formData);
    setIsExternalModalOpen(false);
    setFormData({ eventId: '', userId: '', externalEmail: '' });
  };

  // Stats
  const totalAttendees = filteredAttendees.length;
  const checkedIn = filteredAttendees.filter((a) => a.checkinTime).length;
  const external = filteredAttendees.filter((a) => !a.userId).length;

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats & Filter */}
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
          options={[{ value: '', label: 'All Events' }, ...MOCK_EVENTS]}
          className="w-48"
        />
      </div>

      {/* Attendees Table */}
      <Card padding="none">
        <Table
          columns={columns}
          data={filteredAttendees}
          keyExtractor={(attendee) => attendee.id}
          emptyMessage="No attendees registered yet"
        />
      </Card>

      {/* Register User Modal */}
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
            options={MOCK_EVENTS}
            required
          />
          <Select
            label="Select User"
            placeholder="Choose a user"
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            options={MOCK_USERS}
            required
          />
          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600">
            <p>The user will be registered for this event and can check in on the event day.</p>
          </div>
        </form>
      </Modal>

      {/* External Attendee Modal */}
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
            options={MOCK_EVENTS}
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
