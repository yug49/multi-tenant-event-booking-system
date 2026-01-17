import { useState } from 'react';
import { Button, Card, Table, Badge } from '../components/ui';

// Mock data for reports
const MOCK_DOUBLE_BOOKED = [
  {
    userId: '1',
    userName: 'John Smith',
    conflictingEvents: [
      { event1: 'Opening Keynote', event2: 'Workshop: Cloud Architecture', time: 'Feb 15, 9:00 AM - 10:30 AM' },
    ],
  },
  {
    userId: '3',
    userName: 'Mike Wilson',
    conflictingEvents: [
      { event1: 'Team Meeting', event2: 'Product Demo', time: 'Feb 20, 2:00 PM - 3:00 PM' },
    ],
  },
];

const MOCK_RESOURCE_VIOLATIONS = [
  {
    id: '1',
    resourceName: 'Main Conference Hall',
    violationType: 'EXCLUSIVE_OVERLAP',
    events: ['Annual Tech Conference', 'Corporate Meetup'],
    time: 'Feb 15, 9:00 AM - 12:00 PM',
  },
  {
    id: '2',
    resourceName: 'Projector',
    violationType: 'SHAREABLE_EXCEEDED',
    events: ['Workshop A', 'Workshop B', 'Workshop C', 'Workshop D', 'Workshop E', 'Training Session'],
    time: 'Feb 15, 11:00 AM - 1:00 PM',
    maxConcurrent: 5,
    actualConcurrent: 6,
  },
  {
    id: '3',
    resourceName: 'Printed Handouts',
    violationType: 'CONSUMABLE_EXCEEDED',
    events: ['Conference Day 1', 'Conference Day 2'],
    available: 500,
    requested: 650,
  },
];

const MOCK_UTILIZATION = [
  { resourceId: '1', resourceName: 'Main Conference Hall', totalHours: 45, peakConcurrent: 1, utilizationRate: 75 },
  { resourceId: '2', resourceName: 'Meeting Room A', totalHours: 28, peakConcurrent: 1, utilizationRate: 47 },
  { resourceId: '3', resourceName: 'Projector', totalHours: 62, peakConcurrent: 4, utilizationRate: 82 },
  { resourceId: '4', resourceName: 'Wireless Microphone', totalHours: 35, peakConcurrent: 2, utilizationRate: 58 },
];

const MOCK_PARENT_CHILD_VIOLATIONS = [
  {
    parentEvent: 'Annual Tech Conference',
    childEvent: 'Networking Lunch',
    parentTime: 'Feb 15, 9:00 AM - 6:00 PM',
    childTime: 'Feb 15, 12:00 PM - 7:00 PM',
    reason: 'Child event ends after parent event',
  },
];

const MOCK_EXTERNAL_THRESHOLD = [
  { eventName: 'Annual Tech Conference', totalAttendees: 150, externalCount: 45, percentage: 30 },
  { eventName: 'Open Workshop', totalAttendees: 40, externalCount: 25, percentage: 62 },
];

type ReportTab = 'double-booked' | 'violations' | 'utilization' | 'parent-child' | 'external';

export default function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('double-booked');

  const tabs = [
    { id: 'double-booked' as const, label: 'Double-Booked Users' },
    { id: 'violations' as const, label: 'Resource Violations' },
    { id: 'utilization' as const, label: 'Utilization' },
    { id: 'parent-child' as const, label: 'Time Violations' },
    { id: 'external' as const, label: 'External Attendees' },
  ];

  const getViolationBadge = (type: string) => {
    switch (type) {
      case 'EXCLUSIVE_OVERLAP':
        return <Badge variant="error">Exclusive Overlap</Badge>;
      case 'SHAREABLE_EXCEEDED':
        return <Badge variant="warning">Limit Exceeded</Badge>;
      case 'CONSUMABLE_EXCEEDED':
        return <Badge variant="error">Quantity Exceeded</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Analytics and constraint violation reports</p>
        </div>
        <Button variant="secondary">
          Refresh Data
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Double-Booked Users */}
      {activeTab === 'double-booked' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Users with Overlapping Registrations</h3>
            <p className="text-xs text-gray-500 mt-1">Users registered for events with conflicting schedules</p>
          </div>
          <Table
            columns={[
              {
                key: 'user',
                header: 'User',
                render: (item: typeof MOCK_DOUBLE_BOOKED[0]) => (
                  <span className="font-medium">{item.userName}</span>
                ),
              },
              {
                key: 'conflicts',
                header: 'Conflicting Events',
                render: (item: typeof MOCK_DOUBLE_BOOKED[0]) => (
                  <div className="space-y-1">
                    {item.conflictingEvents.map((conflict, i) => (
                      <div key={i} className="text-sm">
                        <span className="text-gray-900">{conflict.event1}</span>
                        <span className="text-gray-400 mx-2">↔</span>
                        <span className="text-gray-900">{conflict.event2}</span>
                        <span className="text-gray-500 ml-2 text-xs">({conflict.time})</span>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]}
            data={MOCK_DOUBLE_BOOKED}
            keyExtractor={(item) => item.userId}
            emptyMessage="No double-booking conflicts found"
          />
        </Card>
      )}

      {/* Resource Violations */}
      {activeTab === 'violations' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Resource Constraint Violations</h3>
            <p className="text-xs text-gray-500 mt-1">Resources with allocation conflicts or exceeded limits</p>
          </div>
          <Table
            columns={[
              {
                key: 'resource',
                header: 'Resource',
                render: (item: typeof MOCK_RESOURCE_VIOLATIONS[0]) => (
                  <span className="font-medium">{item.resourceName}</span>
                ),
              },
              {
                key: 'type',
                header: 'Violation',
                render: (item: typeof MOCK_RESOURCE_VIOLATIONS[0]) => getViolationBadge(item.violationType),
              },
              {
                key: 'details',
                header: 'Details',
                render: (item: typeof MOCK_RESOURCE_VIOLATIONS[0]) => (
                  <div className="text-sm">
                    {item.violationType === 'EXCLUSIVE_OVERLAP' && (
                      <span>Events overlap: {item.events.join(', ')}</span>
                    )}
                    {item.violationType === 'SHAREABLE_EXCEEDED' && (
                      <span>
                        {item.actualConcurrent} concurrent uses (max: {item.maxConcurrent})
                      </span>
                    )}
                    {item.violationType === 'CONSUMABLE_EXCEEDED' && (
                      <span>
                        Requested: {item.requested}, Available: {item.available}
                      </span>
                    )}
                  </div>
                ),
              },
            ]}
            data={MOCK_RESOURCE_VIOLATIONS}
            keyExtractor={(item) => item.id}
            emptyMessage="No resource violations found"
          />
        </Card>
      )}

      {/* Utilization */}
      {activeTab === 'utilization' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Resource Utilization</h3>
            <p className="text-xs text-gray-500 mt-1">Usage metrics and efficiency analysis</p>
          </div>
          <Table
            columns={[
              {
                key: 'resource',
                header: 'Resource',
                render: (item: typeof MOCK_UTILIZATION[0]) => (
                  <span className="font-medium">{item.resourceName}</span>
                ),
              },
              {
                key: 'hours',
                header: 'Total Hours',
                render: (item: typeof MOCK_UTILIZATION[0]) => (
                  <span>{item.totalHours}h</span>
                ),
              },
              {
                key: 'peak',
                header: 'Peak Concurrent',
                render: (item: typeof MOCK_UTILIZATION[0]) => (
                  <span>{item.peakConcurrent}</span>
                ),
              },
              {
                key: 'rate',
                header: 'Utilization',
                render: (item: typeof MOCK_UTILIZATION[0]) => (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.utilizationRate >= 70 ? 'bg-emerald-500' : 
                          item.utilizationRate >= 40 ? 'bg-amber-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${item.utilizationRate}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{item.utilizationRate}%</span>
                  </div>
                ),
              },
            ]}
            data={MOCK_UTILIZATION}
            keyExtractor={(item) => item.resourceId}
            emptyMessage="No utilization data available"
          />
        </Card>
      )}

      {/* Parent-Child Violations */}
      {activeTab === 'parent-child' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Parent-Child Time Violations</h3>
            <p className="text-xs text-gray-500 mt-1">Child sessions that exceed parent event boundaries</p>
          </div>
          <Table
            columns={[
              {
                key: 'parent',
                header: 'Parent Event',
                render: (item: typeof MOCK_PARENT_CHILD_VIOLATIONS[0]) => (
                  <div>
                    <span className="font-medium">{item.parentEvent}</span>
                    <div className="text-xs text-gray-500">{item.parentTime}</div>
                  </div>
                ),
              },
              {
                key: 'child',
                header: 'Child Session',
                render: (item: typeof MOCK_PARENT_CHILD_VIOLATIONS[0]) => (
                  <div>
                    <span className="font-medium">{item.childEvent}</span>
                    <div className="text-xs text-gray-500">{item.childTime}</div>
                  </div>
                ),
              },
              {
                key: 'reason',
                header: 'Violation',
                render: (item: typeof MOCK_PARENT_CHILD_VIOLATIONS[0]) => (
                  <Badge variant="error">{item.reason}</Badge>
                ),
              },
            ]}
            data={MOCK_PARENT_CHILD_VIOLATIONS}
            keyExtractor={(item) => `${item.parentEvent}-${item.childEvent}`}
            emptyMessage="No time boundary violations found"
          />
        </Card>
      )}

      {/* External Attendees */}
      {activeTab === 'external' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">External Attendees Report</h3>
            <p className="text-xs text-gray-500 mt-1">Events with high external attendee counts</p>
          </div>
          <Table
            columns={[
              {
                key: 'event',
                header: 'Event',
                render: (item: typeof MOCK_EXTERNAL_THRESHOLD[0]) => (
                  <span className="font-medium">{item.eventName}</span>
                ),
              },
              {
                key: 'total',
                header: 'Total Attendees',
                render: (item: typeof MOCK_EXTERNAL_THRESHOLD[0]) => (
                  <span>{item.totalAttendees}</span>
                ),
              },
              {
                key: 'external',
                header: 'External',
                render: (item: typeof MOCK_EXTERNAL_THRESHOLD[0]) => (
                  <span>{item.externalCount}</span>
                ),
              },
              {
                key: 'percentage',
                header: 'Percentage',
                render: (item: typeof MOCK_EXTERNAL_THRESHOLD[0]) => (
                  <Badge variant={item.percentage > 50 ? 'warning' : 'default'}>
                    {item.percentage}%
                  </Badge>
                ),
              },
            ]}
            data={MOCK_EXTERNAL_THRESHOLD}
            keyExtractor={(item) => item.eventName}
            emptyMessage="No external attendee data available"
          />
        </Card>
      )}
    </div>
  );
}
