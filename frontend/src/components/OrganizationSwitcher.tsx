import { useOrganization } from '../context';

export default function OrganizationSwitcher() {
  const { organizations, selectedOrganization, setSelectedOrganization } = useOrganization();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 hidden sm:inline">Organization:</span>
      <select
        value={selectedOrganization?.id || ''}
        onChange={(e) => {
          const org = organizations.find((o) => o.id === e.target.value);
          if (org) setSelectedOrganization(org);
        }}
        className="px-3 py-1.5 text-sm font-medium bg-gray-100 border-0 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1 cursor-pointer hover:bg-gray-200 transition-colors"
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </select>
    </div>
  );
}
