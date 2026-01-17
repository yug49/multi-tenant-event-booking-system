import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Modal, Input, Table, Alert, SkeletonTable } from '../components/ui';
import type { Organization, User } from '../types';
import { organizationService, userService } from '../services';
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

  // User management state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [managingOrg, setManagingOrg] = useState<Organization | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [userFormError, setUserFormError] = useState<string | null>(null);

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

  // User management functions
  const openUserModal = async (org: Organization) => {
    setManagingOrg(org);
    setIsUserModalOpen(true);
    setUserError(null);
    await fetchUsers(org.id);
  };

  const fetchUsers = async (orgId: string) => {
    try {
      setIsLoadingUsers(true);
      const response = await userService.getAll(orgId);
      setUsers(response.data);
    } catch (err) {
      setUserError('Failed to fetch users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const resetUserForm = () => {
    setUserFormData({ name: '', email: '', password: '' });
    setEditingUser(null);
    setUserFormError(null);
  };

  const openAddUserForm = () => {
    resetUserForm();
    setIsUserFormOpen(true);
  };

  const openEditUserForm = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
    });
    setUserFormError(null);
    setIsUserFormOpen(true);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingOrg) return;
    
    setUserFormError(null);
    setIsSavingUser(true);

    try {
      if (editingUser) {
        const updateData: Partial<User> & { password?: string } = {
          name: userFormData.name,
          email: userFormData.email,
        };
        if (userFormData.password) {
          updateData.password = userFormData.password;
        }
        await userService.update(editingUser.id, updateData);
      } else {
        await userService.create({
          name: userFormData.name,
          email: userFormData.email,
          password: userFormData.password,
          organizationId: managingOrg.id,
        });
      }
      setIsUserFormOpen(false);
      resetUserForm();
      await fetchUsers(managingOrg.id);
    } catch (err: any) {
      const message = err.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : message || 'Failed to save user';
      setUserFormError(errorMsg);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!managingOrg) return;
    if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      return;
    }

    try {
      await userService.delete(user.id);
      await fetchUsers(managingOrg.id);
    } catch (err: any) {
      const message = err.response?.data?.message;
      const errorMsg = Array.isArray(message) ? message.join(', ') : message || 'Failed to delete user';
      setUserError(errorMsg);
    }
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
                      onClick={() => openUserModal(org)}
                    >
                      Manage Users
                    </Button>
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

      {/* User Management Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setIsUserFormOpen(false);
          resetUserForm();
        }}
        title={`Manage Users - ${managingOrg?.name || ''}`}
      >
        <div className="space-y-4">
          {userError && (
            <Alert variant="error" onClose={() => setUserError(null)}>
              {userError}
            </Alert>
          )}

          {!isUserFormOpen ? (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {users.length} user{users.length !== 1 ? 's' : ''} in this organization
                </p>
                <Button size="sm" onClick={openAddUserForm}>
                  Add User
                </Button>
              </div>

              {isLoadingUsers ? (
                <div className="text-center py-4 text-gray-500">Loading users...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users in this organization yet.
                </div>
              ) : (
                <div className="border rounded-lg divide-y max-h-80 overflow-y-auto">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openEditUserForm(user)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleUserSubmit} className="space-y-4">
              {userFormError && (
                <Alert variant="error" onClose={() => setUserFormError(null)}>
                  {userFormError}
                </Alert>
              )}

              <Input
                label="Name"
                value={userFormData.name}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, name: e.target.value })
                }
                required
                placeholder="Enter user name"
              />

              <Input
                label="Email"
                type="email"
                value={userFormData.email}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, email: e.target.value })
                }
                required
                placeholder="Enter email address"
              />

              <Input
                label={editingUser ? 'Password (leave blank to keep current)' : 'Password'}
                type="password"
                value={userFormData.password}
                onChange={(e) =>
                  setUserFormData({ ...userFormData, password: e.target.value })
                }
                required={!editingUser}
                placeholder="Enter password"
              />

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSavingUser}>
                  {isSavingUser ? 'Saving...' : editingUser ? 'Update User' : 'Add User'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsUserFormOpen(false);
                    resetUserForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}
