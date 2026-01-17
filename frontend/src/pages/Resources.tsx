import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Modal, Input, Select, Table, Badge, Alert, SkeletonTable } from '../components/ui';
import type { Resource, Event } from '../types';
import { ResourceType } from '../types';
import { resourceService, eventService, allocationService } from '../services';
import { useOrganization } from '../context';

export default function Resources() {
  const { selectedOrganization } = useOrganization();
  const [resources, setResources] = useState<Resource[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: ResourceType;
    isGlobal: boolean;
    maxConcurrentUsage: string;
    availableQuantity: string;
  }>({
    name: '',
    description: '',
    type: ResourceType.EXCLUSIVE,
    isGlobal: false,
    maxConcurrentUsage: '',
    availableQuantity: '',
  });
  const [allocateForm, setAllocateForm] = useState({
    eventId: '',
    quantityUsed: '',
  });

  const fetchData = useCallback(async () => {
    if (!selectedOrganization) return;
    try {
      setIsLoading(true);
      setError(null);
      const [resourcesRes, eventsRes] = await Promise.all([
        resourceService.getAll(),
        eventService.getAll(),
      ]);
      // Filter resources: org-specific OR global
      const filtered = resourcesRes.data.filter(
        (r) => r.organizationId === selectedOrganization.id || r.isGlobal
      );
      setResources(filtered);
      // Filter events by org
      const orgEvents = eventsRes.data.filter(
        (e) => e.organizationId === selectedOrganization.id
      );
      setEvents(orgEvents);
    } catch (err) {
      setError('Failed to fetch resources');
      console.error('Error fetching resources:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getTypeVariant = (type: ResourceType): 'default' | 'success' | 'warning' | 'error' | 'info' => {
    switch (type) {
      case ResourceType.EXCLUSIVE:
        return 'default';
      case ResourceType.SHAREABLE:
        return 'info';
      case ResourceType.CONSUMABLE:
        return 'warning';
      default:
        return 'default';
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: ResourceType.EXCLUSIVE,
      isGlobal: false,
      maxConcurrentUsage: '',
      availableQuantity: '',
    });
    setEditingResource(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      description: resource.description || '',
      type: resource.type,
      isGlobal: resource.isGlobal,
      maxConcurrentUsage: resource.maxConcurrentUsage?.toString() || '',
      availableQuantity: resource.availableQuantity?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrganization) return;

    try {
      const resourceData = {
        name: formData.name,
        description: formData.description || null,
        type: formData.type,
        isGlobal: formData.isGlobal,
        organizationId: formData.isGlobal ? null : selectedOrganization.id,
        maxConcurrentUsage: formData.type === ResourceType.SHAREABLE ? parseInt(formData.maxConcurrentUsage, 10) : null,
        availableQuantity: formData.type === ResourceType.CONSUMABLE ? parseInt(formData.availableQuantity, 10) : null,
      };

      if (editingResource) {
        await resourceService.update(editingResource.id, resourceData);
      } else {
        await resourceService.create(resourceData);
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      const message = err.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : message || 'Failed to save resource';
      setError(errorMsg);
    }
  };

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`Are you sure you want to delete "${resource.name}"?`)) return;

    try {
      await resourceService.delete(resource.id);
      fetchData();
    } catch (err) {
      setError('Failed to delete resource');
      console.error('Error deleting resource:', err);
    }
  };

  const handleAllocate = async () => {
    if (!selectedResource || !allocateForm.eventId) return;

    try {
      await allocationService.create({
        eventId: allocateForm.eventId,
        resourceId: selectedResource.id,
        quantityUsed: selectedResource.type === ResourceType.CONSUMABLE
          ? parseInt(allocateForm.quantityUsed, 10)
          : undefined,
      });
      setIsAllocateModalOpen(false);
      setAllocateForm({ eventId: '', quantityUsed: '' });
      setSelectedResource(null);
      fetchData();
    } catch (err: any) {
      const message = err.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : message || 'Failed to allocate resource';
      setError(errorMsg);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Resource',
      render: (resource: Resource) => (
        <div>
          <div className="font-medium text-gray-900 flex items-center gap-2">
            {resource.name}
            {resource.isGlobal && (
              <span className="text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                Global
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{resource.description}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (resource: Resource) => (
        <Badge variant={getTypeVariant(resource.type)}>{resource.type}</Badge>
      ),
    },
    {
      key: 'availability',
      header: 'Availability',
      render: (resource: Resource) => {
        if (resource.type === ResourceType.SHAREABLE) {
          return <span className="text-sm">Max {resource.maxConcurrentUsage} concurrent</span>;
        }
        if (resource.type === ResourceType.CONSUMABLE) {
          return <span className="text-sm">{resource.availableQuantity} available</span>;
        }
        return <span className="text-sm text-gray-400">—</span>;
      },
    },
    {
      key: 'actions',
      header: '',
      render: (resource: Resource) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedResource(resource);
              setAllocateForm({ eventId: '', quantityUsed: '' });
              setIsAllocateModalOpen(true);
            }}
          >
            Allocate
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(resource)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(resource)}>
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
          <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-1">Manage rooms, equipment, and consumables</p>
        </div>
        <Button onClick={openCreateModal}>Add Resource</Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          <span>Exclusive: One event at a time</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          <span>Shareable: Limited concurrent use</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>Consumable: Quantity tracked</span>
        </div>
      </div>

      <Card padding="none">
        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : (
          <Table
            columns={columns}
            data={resources}
            keyExtractor={(resource) => resource.id}
            emptyMessage="No resources added yet"
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingResource ? 'Edit Resource' : 'Add Resource'}
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsModalOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingResource ? 'Save Changes' : 'Add Resource'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Resource Name"
            placeholder="e.g., Conference Room A"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Description"
            placeholder="Brief description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Select
            label="Resource Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
            options={[
              { value: ResourceType.EXCLUSIVE, label: 'Exclusive (rooms, venues)' },
              { value: ResourceType.SHAREABLE, label: 'Shareable (equipment)' },
              { value: ResourceType.CONSUMABLE, label: 'Consumable (materials)' },
            ]}
          />
          {formData.type === ResourceType.SHAREABLE && (
            <Input
              label="Max Concurrent Usage"
              type="number"
              placeholder="How many events can use simultaneously"
              value={formData.maxConcurrentUsage}
              onChange={(e) => setFormData({ ...formData, maxConcurrentUsage: e.target.value })}
              required
            />
          )}
          {formData.type === ResourceType.CONSUMABLE && (
            <Input
              label="Available Quantity"
              type="number"
              placeholder="Total quantity available"
              value={formData.availableQuantity}
              onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
              required
            />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={formData.isGlobal}
              onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
              className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            <span className="text-gray-700">Make this a global resource (shared across organizations)</span>
          </label>
        </form>
      </Modal>

      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => {
          setIsAllocateModalOpen(false);
          setSelectedResource(null);
        }}
        title={`Allocate: ${selectedResource?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => {
              setIsAllocateModalOpen(false);
              setSelectedResource(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleAllocate}>Allocate</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Event"
            placeholder="Choose an event"
            value={allocateForm.eventId}
            onChange={(e) => setAllocateForm({ ...allocateForm, eventId: e.target.value })}
            options={events.map((e) => ({ value: e.id, label: e.name }))}
          />
          {selectedResource?.type === ResourceType.CONSUMABLE && (
            <Input
              label="Quantity to Allocate"
              type="number"
              placeholder="Enter quantity"
              value={allocateForm.quantityUsed}
              onChange={(e) => setAllocateForm({ ...allocateForm, quantityUsed: e.target.value })}
            />
          )}
          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600">
            {selectedResource?.type === ResourceType.EXCLUSIVE && (
              <p>This resource can only be used by one event at a time. The system will check for scheduling conflicts.</p>
            )}
            {selectedResource?.type === ResourceType.SHAREABLE && (
              <p>This resource can be shared by up to {selectedResource.maxConcurrentUsage} events simultaneously.</p>
            )}
            {selectedResource?.type === ResourceType.CONSUMABLE && (
              <p>Available quantity: {selectedResource.availableQuantity}. Enter the amount needed for this event.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
