import { useState } from 'react';
import { Button, Card, Modal, Input, Select, Table, Badge } from '../components/ui';
import type { Resource } from '../types';
import { ResourceType } from '../types';

// Mock data for development
const MOCK_RESOURCES: Resource[] = [
  {
    id: '1',
    name: 'Main Conference Hall',
    description: 'Large hall with 500 seats',
    type: ResourceType.EXCLUSIVE,
    organizationId: '1',
    isGlobal: false,
    maxConcurrentUsage: null,
    availableQuantity: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Meeting Room A',
    description: 'Small meeting room, 10 capacity',
    type: ResourceType.EXCLUSIVE,
    organizationId: '1',
    isGlobal: false,
    maxConcurrentUsage: null,
    availableQuantity: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Projector',
    description: 'HD Projector with HDMI',
    type: ResourceType.SHAREABLE,
    organizationId: null,
    isGlobal: true,
    maxConcurrentUsage: 5,
    availableQuantity: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Wireless Microphone',
    description: 'Wireless mic with receiver',
    type: ResourceType.SHAREABLE,
    organizationId: '1',
    isGlobal: false,
    maxConcurrentUsage: 3,
    availableQuantity: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Printed Handouts',
    description: 'Conference materials pack',
    type: ResourceType.CONSUMABLE,
    organizationId: '1',
    isGlobal: false,
    maxConcurrentUsage: null,
    availableQuantity: 500,
    createdAt: new Date().toISOString(),
  },
];

export default function Resources() {
  const [resources] = useState<Resource[]>(MOCK_RESOURCES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAllocateModalOpen, setIsAllocateModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
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
              setIsAllocateModalOpen(true);
            }}
          >
            Allocate
          </Button>
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
      ),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Create resource:', formData);
    setIsModalOpen(false);
    setFormData({
      name: '',
      description: '',
      type: ResourceType.EXCLUSIVE,
      isGlobal: false,
      maxConcurrentUsage: '',
      availableQuantity: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
          <p className="text-sm text-gray-500 mt-1">Manage rooms, equipment, and consumables</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add Resource</Button>
      </div>

      {/* Resource Type Legend */}
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

      {/* Resources Table */}
      <Card padding="none">
        <Table
          columns={columns}
          data={resources}
          keyExtractor={(resource) => resource.id}
          emptyMessage="No resources added yet"
        />
      </Card>

      {/* Create Resource Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Resource"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Resource</Button>
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

      {/* Allocate Resource Modal */}
      <Modal
        isOpen={isAllocateModalOpen}
        onClose={() => setIsAllocateModalOpen(false)}
        title={`Allocate: ${selectedResource?.name}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAllocateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAllocateModalOpen(false)}>Allocate</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Select Event"
            placeholder="Choose an event"
            options={[
              { value: '1', label: 'Annual Tech Conference' },
              { value: '2', label: 'Opening Keynote' },
              { value: '3', label: 'Workshop: Cloud Architecture' },
              { value: '4', label: 'Team Building Session' },
            ]}
          />
          {selectedResource?.type === ResourceType.CONSUMABLE && (
            <Input
              label="Quantity to Allocate"
              type="number"
              placeholder="Enter quantity"
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
