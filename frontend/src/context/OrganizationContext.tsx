import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Organization } from '../types';

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  setSelectedOrganization: (org: Organization) => void;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// Mock data for initial development
const MOCK_ORGANIZATIONS: Organization[] = [
  { id: '1', name: 'Acme Corporation', createdAt: new Date().toISOString() },
  { id: '2', name: 'TechStart Inc', createdAt: new Date().toISOString() },
  { id: '3', name: 'Global Events Ltd', createdAt: new Date().toISOString() },
];

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS);
  const [selectedOrganization, setSelectedOrganizationState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with stored organization or first one
    const storedOrgId = localStorage.getItem('selectedOrganizationId');
    const org = organizations.find((o) => o.id === storedOrgId) || organizations[0];
    if (org) {
      setSelectedOrganizationState(org);
      localStorage.setItem('selectedOrganizationId', org.id);
    }
    setIsLoading(false);
  }, [organizations]);

  const setSelectedOrganization = (org: Organization) => {
    setSelectedOrganizationState(org);
    localStorage.setItem('selectedOrganizationId', org.id);
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        selectedOrganization,
        setSelectedOrganization,
        isLoading,
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
