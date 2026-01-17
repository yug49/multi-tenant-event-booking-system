import { NavLink, Outlet } from 'react-router-dom';
import OrganizationSwitcher from './OrganizationSwitcher';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◫' },
  { to: '/events', label: 'Events', icon: '◉' },
  { to: '/resources', label: 'Resources', icon: '▣' },
  { to: '/attendees', label: 'Attendees', icon: '◎' },
  { to: '/reports', label: 'Reports', icon: '▤' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 z-50">
        <div className="h-full px-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-base font-semibold text-gray-900 tracking-tight">
              EventBook
            </h1>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <OrganizationSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
