import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Organization } from '../types';
import { organizationService } from '../services';

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization | null) => void;
  isLoading: boolean;
  error: string | null;
  fetchOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganizationState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await organizationService.getAll();
      const orgs = response.data;
      setOrganizations(orgs);

      // Initialize with stored organization or first one
      const storedOrgId = localStorage.getItem('selectedOrganizationId');
      const org = orgs.find((o) => o.id === storedOrgId) || orgs[0];
      if (org) {
        setSelectedOrganizationState(org);
        localStorage.setItem('selectedOrganizationId', org.id);
      }
    } catch (err) {
      setError('Failed to fetch organizations');
      console.error('Error fetching organizations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const setSelectedOrganization = (org: Organization | null) => {
    setSelectedOrganizationState(org);
    if (org) {
      localStorage.setItem('selectedOrganizationId', org.id);
    } else {
      localStorage.removeItem('selectedOrganizationId');
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        selectedOrganization,
        setSelectedOrganization,
        isLoading,
        error,
        fetchOrganizations,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
