import { useState } from 'react';
import { Button, Card, Modal, Input, Select, Table, Badge } from '../components/ui';
import type { Event } from '../types';

// Mock data for development
const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    name: 'Annual Tech Conference',
    description: 'Main conference event',
    startTime: '2026-02-15T09:00:00Z',
    endTime: '2026-02-15T18:00:00Z',
    capacity: 500,
    organizationId: '1',
    parentEventId: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Opening Keynote',
    description: 'Welcome and keynote presentation',
    startTime: '2026-02-15T09:00:00Z',
    endTime: '2026-02-15T10:30:00Z',
    capacity: 500,
    organizationId: '1',
    parentEventId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Workshop: Cloud Architecture',
    description: 'Hands-on workshop',
    startTime: '2026-02-15T11:00:00Z',
    endTime: '2026-02-15T13:00:00Z',
    capacity: 50,
    organizationId: '1',
    parentEventId: '1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Team Building Session',
    description: 'Quarterly team activity',
    startTime: '2026-02-20T14:00:00Z',
    endTime: '2026-02-20T17:00:00Z',
    capacity: 30,
    organizationId: '1',
    parentEventId: null,
    createdAt: new Date().toISOString(),
  },
];

export default function Events() {
  const [events] = useState<Event[]>(MOCK_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    capacity: '',
    parentEventId: '',
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const parentEvents = events.filter((e) => e.parentEventId === null);

  const columns = [
    {
      key: 'name',
      header: 'Event',
      render: (event: Event) => (
        <div>
          <div className="font-medium text-gray-900">{event.name}</div>
          <div className="text-xs text-gray-500 mt-0.5">{event.description}</div>
        </div>
      ),
    },
    {
      key: 'schedule',
      header: 'Schedule',
      render: (event: Event) => (
        <div className="text-sm">
          <div>{formatDate(event.startTime)}</div>
          <div className="text-xs text-gray-500">
            {formatTime(event.startTime)} - {formatTime(event.endTime)}
          </div>
        </div>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (event: Event) => <span>{event.capacity}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      render: (event: Event) => (
        <Badge variant={event.parentEventId ? 'info' : 'default'}>
          {event.parentEventId ? 'Session' : 'Parent'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: () => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      ),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API call to create event
    console.log('Create event:', formData);
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      capacity: '',
      parentEventId: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your organization's events and sessions</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create Event</Button>
      </div>

      {/* Events Table */}
      <Card padding="none">
        <Table
          columns={columns}
          data={events}
          keyExtractor={(event) => event.id}
          emptyMessage="No events created yet"
        />
      </Card>

      {/* Create Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Event"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create Event</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Event Name"
            placeholder="Enter event name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
            <Input
              label="End Time"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacity"
              type="number"
              placeholder="Max attendees"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              required
            />
            <Select
              label="Parent Event"
              placeholder="None (standalone)"
              value={formData.parentEventId}
              onChange={(e) => setFormData({ ...formData, parentEventId: e.target.value })}
              options={[
                { value: '', label: 'None (standalone)' },
                ...parentEvents.map((e) => ({ value: e.id, label: e.name })),
              ]}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
