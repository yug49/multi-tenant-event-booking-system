import { Card } from '../components/ui';
import { useOrganization } from '../context';

// Mock stats for dashboard
const MOCK_STATS = {
  totalEvents: 12,
  upcomingEvents: 4,
  totalResources: 8,
  totalAttendees: 156,
  checkedIn: 89,
  violations: 3,
};

const MOCK_UPCOMING_EVENTS = [
  { id: '1', name: 'Annual Tech Conference', date: 'Feb 15, 2026', attendees: 150 },
  { id: '2', name: 'Team Building Session', date: 'Feb 20, 2026', attendees: 28 },
  { id: '3', name: 'Product Launch', date: 'Feb 25, 2026', attendees: 75 },
];

export default function Dashboard() {
  const { selectedOrganization } = useOrganization();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview for {selectedOrganization?.name || 'your organization'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-semibold text-gray-900">{MOCK_STATS.totalEvents}</div>
          <div className="text-xs text-gray-500 mt-1">Total Events</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-semibold text-gray-900">{MOCK_STATS.upcomingEvents}</div>
          <div className="text-xs text-gray-500 mt-1">Upcoming</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-semibold text-gray-900">{MOCK_STATS.totalResources}</div>
          <div className="text-xs text-gray-500 mt-1">Resources</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-semibold text-gray-900">{MOCK_STATS.totalAttendees}</div>
          <div className="text-xs text-gray-500 mt-1">Registrations</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-semibold text-emerald-600">{MOCK_STATS.checkedIn}</div>
          <div className="text-xs text-gray-500 mt-1">Checked In</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-semibold text-red-600">{MOCK_STATS.violations}</div>
          <div className="text-xs text-gray-500 mt-1">Violations</div>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <h2 className="text-sm font-medium text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {MOCK_UPCOMING_EVENTS.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <div>
                  <div className="font-medium text-gray-900 text-sm">{event.name}</div>
                  <div className="text-xs text-gray-500">{event.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{event.attendees}</div>
                  <div className="text-xs text-gray-500">attendees</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <h2 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/events"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg mb-1">◉</div>
              <div className="text-sm font-medium text-gray-900">Create Event</div>
              <div className="text-xs text-gray-500">Schedule a new event</div>
            </a>
            <a
              href="/resources"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg mb-1">▣</div>
              <div className="text-sm font-medium text-gray-900">Add Resource</div>
              <div className="text-xs text-gray-500">Manage equipment & rooms</div>
            </a>
            <a
              href="/attendees"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg mb-1">◎</div>
              <div className="text-sm font-medium text-gray-900">Register Attendee</div>
              <div className="text-xs text-gray-500">Add users to events</div>
            </a>
            <a
              href="/reports"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-lg mb-1">▤</div>
              <div className="text-sm font-medium text-gray-900">View Reports</div>
              <div className="text-xs text-gray-500">Analytics & violations</div>
            </a>
          </div>
        </Card>
      </div>

      {/* Alerts Section */}
      {MOCK_STATS.violations > 0 && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <div className="text-red-600 text-lg">⚠</div>
            <div>
              <h3 className="text-sm font-medium text-red-900">Attention Required</h3>
              <p className="text-sm text-red-700 mt-1">
                There are {MOCK_STATS.violations} resource constraint violations that need your attention.
                <a href="/reports" className="underline ml-1">View details →</a>
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
