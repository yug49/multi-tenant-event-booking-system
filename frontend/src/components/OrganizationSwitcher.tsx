import { useOrganization } from '../context';

export default function OrganizationSwitcher() {
  const { organizations, selectedOrganization, setSelectedOrganization } = useOrganization();

  return (
    <select
      value={selectedOrganization?.id || ''}
      onChange={(e) => {
        const org = organizations.find((o) => o.id === e.target.value);
        if (org) setSelectedOrganization(org);
      }}
      className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  );
}
