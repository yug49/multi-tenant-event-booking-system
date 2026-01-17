import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Modal, Input, Table, Alert, SkeletonTable } from '../components/ui';
import type { Organization } from '../types';
import { organizationService } from '../services';
import { useOrganization } from '../context';

export default function Organizations() {
  const { organizations, fetchOrganizations, selectedOrganization, setSelectedOrganization } = useOrganization();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const loadOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await fetchOrganizations();
    } catch (err) {
      setError('Failed to fetch organizations');
    } finally {
      setIsLoading(false);
    }
  }, [fetchOrganizations]);

  useEffect(() => {
    loadOrganizations();
  }, [loadOrganizations]);

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingOrg(null);
    setFormError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      description: org.description || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);

    try {
      if (editingOrg) {
        await organizationService.update(editingOrg.id, formData);
      } else {
        await organizationService.create(formData);
      }
      setIsModalOpen(false);
      resetForm();
      await fetchOrganizations();
    } catch (err: any) {
      const message = err.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : message || 'Failed to save organization';
      setFormError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"? This will delete all associated users, events, and resources.`)) {
      return;
    }

    try {
      await organizationService.delete(org.id);
      if (selectedOrganization?.id === org.id) {
        setSelectedOrganization(null);
      }
      await fetchOrganizations();
    } catch (err: any) {
      const message = err.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : message || 'Failed to delete organization';
      setError(errorMsg);
    }
  };

  const handleSelect = (org: Organization) => {
    setSelectedOrganization(org);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Organizations</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage tenant organizations in the system
          </p>
        </div>
        <Button onClick={openCreateModal}>Create Organization</Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card padding="none">
        {isLoading ? (
          <SkeletonTable rows={3} />
        ) : (
          <Table
            columns={[
              {
                key: 'name',
                header: 'Name',
                render: (org: Organization) => (
                  <div>
                    <span className="font-medium text-gray-900">{org.name}</span>
                    {selectedOrganization?.id === org.id && (
                      <span className="ml-2 text-xs bg-gray-900 text-white px-2 py-0.5 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: 'description',
                header: 'Description',
                render: (org: Organization) => (
                  <span className="text-gray-600">{org.description || '-'}</span>
                ),
              },
              {
                key: 'createdAt',
                header: 'Created',
                render: (org: Organization) => (
                  <span className="text-sm text-gray-500">
                    {new Date(org.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: '',
                render: (org: Organization) => (
                  <div className="flex gap-2 justify-end">
                    {selectedOrganization?.id !== org.id && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSelect(org)}
                      >
                        Select
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(org)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelete(org)}
                    >
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
            data={organizations}
            keyExtractor={(org) => org.id}
            emptyMessage="No organizations found. Create one to get started."
          />
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrg ? 'Edit Organization' : 'Create Organization'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <Alert variant="error" onClose={() => setFormError(null)}>
              {formError}
            </Alert>
          )}
          
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter organization name"
          />
          
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter description (optional)"
          />
          
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingOrg ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
