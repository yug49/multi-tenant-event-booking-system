import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Modal, Input, Select, Table, Badge } from '../components/ui';
import type { Event } from '../types';
import { eventService } from '../services';
import { useOrganization } from '../context';

export default function Events() {
  const { selectedOrganization } = useOrganization();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startTime: '',
    endTime: '',
    capacity: '',
    parentEventId: '',
  });

  const fetchEvents = useCallback(async () => {
    if (!selectedOrganization) return;
    try {
      setIsLoading(true);
      setError(null);
      const response = await eventService.getAll();
      const orgEvents = response.data.filter(
        (e) => e.organizationId === selectedOrganization.id
      );
      setEvents(orgEvents);
    } catch (err) {
      setError('Failed to fetch events');
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      capacity: '',
      parentEventId: '',
    });
    setEditingEvent(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      startTime: event.startTime.slice(0, 16),
      endTime: event.endTime.slice(0, 16),
      capacity: String(event.capacity),
      parentEventId: event.parentEventId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrganization) return;

    try {
      const eventData = {
        name: formData.name,
        description: formData.description || null,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        capacity: parseInt(formData.capacity, 10),
        organizationId: selectedOrganization.id,
        parentEventId: formData.parentEventId || null,
      };

      if (editingEvent) {
        await eventService.update(editingEvent.id, eventData);
      } else {
        await eventService.create(eventData);
      }

      setIsModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to save event';
      setError(message);
      console.error('Error saving event:', err);
    }
  };

  const handleDelete = async (event: Event) => {
    if (!confirm(`Are you sure you want to delete "${event.name}"?`)) return;

    try {
      await eventService.delete(event.id);
      fetchEvents();
    } catch (err) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
    }
  };

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
      render: (event: Event) => (
        <div className="flex gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => openEditModal(event)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(event)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

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
          <h1 className="text-2xl font-semibold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your organization's events and sessions</p>
        </div>
        <Button onClick={openCreateModal}>Create Event</Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-md">
          {error}
          <button className="ml-2 text-red-500" onClick={() => setError(null)}>×</button>
        </div>
      )}

      <Card padding="none">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading events...</div>
        ) : (
          <Table
            columns={columns}
            data={events}
            keyExtractor={(event) => event.id}
            emptyMessage="No events created yet"
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingEvent ? 'Edit Event' : 'Create Event'}
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </Button>
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
                ...parentEvents
                  .filter((pe) => pe.id !== editingEvent?.id)
                  .map((e) => ({ value: e.id, label: e.name })),
              ]}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
