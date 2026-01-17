import { useState, useEffect, useCallback } from 'react';
import { Button, Card, Table, Badge, Alert, SkeletonTable } from '../components/ui';
import { reportService } from '../services';
import { useOrganization } from '../context';

type ReportTab = 'double-booked' | 'violations' | 'utilization' | 'parent-child' | 'external';

export default function Reports() {
  const { selectedOrganization } = useOrganization();
  const [activeTab, setActiveTab] = useState<ReportTab>('double-booked');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Report data states
  const [doubleBooked, setDoubleBooked] = useState<any[]>([]);
  const [violations, setViolations] = useState<{
    shareableViolations: any[];
    exclusiveViolations: any[];
    consumableViolations: any[];
  }>({ shareableViolations: [], exclusiveViolations: [], consumableViolations: [] });
  const [utilization, setUtilization] = useState<any[]>([]);
  const [parentChildViolations, setParentChildViolations] = useState<any[]>([]);
  const [externalAttendees, setExternalAttendees] = useState<any[]>([]);

  const fetchReports = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        doubleBookedRes,
        violationsRes,
        utilizationRes,
        parentChildRes,
        externalRes,
      ] = await Promise.all([
        reportService.getDoubleBookedUsers(),
        reportService.getResourceViolations(),
        reportService.getResourceUtilization(selectedOrganization?.id),
        reportService.getParentChildViolations(),
        reportService.getExternalAttendeeReport(5),
      ]);

      setDoubleBooked(doubleBookedRes.data);
      setViolations(violationsRes.data);
      setUtilization(utilizationRes.data);
      setParentChildViolations(parentChildRes.data);
      setExternalAttendees(externalRes.data);
    } catch (err) {
      setError('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  }, [selectedOrganization]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Combine all violations for display
  const allViolations = [
    ...violations.exclusiveViolations.map((v) => ({ ...v, type: 'EXCLUSIVE_OVERLAP' })),
    ...violations.shareableViolations.map((v) => ({ ...v, type: 'SHAREABLE_EXCEEDED' })),
    ...violations.consumableViolations.map((v) => ({ ...v, type: 'CONSUMABLE_EXCEEDED' })),
  ];

  if (!selectedOrganization) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please select an organization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Analytics and constraint violation reports</p>
        </div>
        <Button variant="secondary" onClick={fetchReports} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Refresh Data'}
        </Button>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

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
          {isLoading ? (
            <SkeletonTable rows={3} />
          ) : (
            <Table
              columns={[
                {
                  key: 'user',
                  header: 'User',
                  render: (item: any) => (
                    <div>
                      <span className="font-medium">{item.user_name}</span>
                      <div className="text-xs text-gray-500">{item.user_email}</div>
                    </div>
                  ),
                },
                {
                  key: 'event1',
                  header: 'Event 1',
                  render: (item: any) => (
                    <div>
                      <span className="text-gray-900">{item.event1_name}</span>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(item.event1_start)} - {formatDateTime(item.event1_end)}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'event2',
                  header: 'Event 2',
                  render: (item: any) => (
                    <div>
                      <span className="text-gray-900">{item.event2_name}</span>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(item.event2_start)} - {formatDateTime(item.event2_end)}
                      </div>
                    </div>
                  ),
                },
              ]}
              data={doubleBooked}
              keyExtractor={(item: any) => `${item.user_id}-${item.event1_id}-${item.event2_id}`}
              emptyMessage="No double-booking conflicts found"
            />
          )}
        </Card>
      )}

      {/* Resource Violations */}
      {activeTab === 'violations' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Resource Constraint Violations</h3>
            <p className="text-xs text-gray-500 mt-1">Resources with allocation conflicts or exceeded limits</p>
          </div>
          {isLoading ? (
            <SkeletonTable rows={3} />
          ) : (
            <Table
              columns={[
                {
                  key: 'resource',
                  header: 'Resource',
                  render: (item: any) => (
                    <span className="font-medium">{item.resource_name}</span>
                  ),
                },
                {
                  key: 'type',
                  header: 'Violation',
                  render: (item: any) => getViolationBadge(item.type),
                },
                {
                  key: 'details',
                  header: 'Details',
                  render: (item: any) => (
                    <div className="text-sm">
                      {item.type === 'EXCLUSIVE_OVERLAP' && (
                        <span>
                          {item.event1_name} / {item.event2_name}
                        </span>
                      )}
                      {item.type === 'SHAREABLE_EXCEEDED' && (
                        <span>
                          {item.concurrent_count} concurrent uses (max: {item.max_concurrent_usage})
                        </span>
                      )}
                      {item.type === 'CONSUMABLE_EXCEEDED' && (
                        <span>
                          Allocated: {item.total_allocated}, Available: {item.available_quantity}
                        </span>
                      )}
                    </div>
                  ),
                },
              ]}
              data={allViolations}
              keyExtractor={(item: any) => `${item.resource_id}-${item.type}-${item.event_id || item.event1_id || ''}`}
              emptyMessage="No resource violations found"
            />
          )}
        </Card>
      )}

      {/* Utilization */}
      {activeTab === 'utilization' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Resource Utilization</h3>
            <p className="text-xs text-gray-500 mt-1">Usage metrics and efficiency analysis</p>
          </div>
          {isLoading ? (
            <SkeletonTable rows={3} />
          ) : (
            <Table
              columns={[
                {
                  key: 'resource',
                  header: 'Resource',
                  render: (item: any) => (
                    <div>
                      <span className="font-medium">{item.resource_name}</span>
                      {item.is_global && (
                        <span className="ml-2 text-[10px] uppercase tracking-wider text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          Global
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'type',
                  header: 'Type',
                  render: (item: any) => <Badge>{item.resource_type}</Badge>,
                },
                {
                  key: 'hours',
                  header: 'Total Hours',
                  render: (item: any) => (
                    <span>{parseFloat(item.total_hours_used || 0).toFixed(1)}h</span>
                  ),
                },
                {
                  key: 'allocations',
                  header: 'Allocations',
                  render: (item: any) => <span>{item.total_allocations}</span>,
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (item: any) => {
                    const status = item.utilization_status;
                    return (
                      <Badge
                        variant={
                          status === 'ACTIVE' ? 'success' :
                          status === 'UNDERUTILIZED' ? 'warning' : 'default'
                        }
                      >
                        {status}
                      </Badge>
                    );
                  },
                },
              ]}
              data={utilization}
              keyExtractor={(item) => item.resource_id}
              emptyMessage="No utilization data available"
            />
          )}
        </Card>
      )}

      {/* Parent-Child Violations */}
      {activeTab === 'parent-child' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">Parent-Child Time Violations</h3>
            <p className="text-xs text-gray-500 mt-1">Child sessions that exceed parent event boundaries</p>
          </div>
          {isLoading ? (
            <SkeletonTable rows={3} />
          ) : (
            <Table
              columns={[
                {
                  key: 'parent',
                  header: 'Parent Event',
                  render: (item: any) => (
                    <div>
                      <span className="font-medium">{item.parent_name}</span>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(item.parent_start)} - {formatDateTime(item.parent_end)}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'child',
                  header: 'Child Session',
                  render: (item: any) => (
                    <div>
                      <span className="font-medium">{item.child_name}</span>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(item.child_start)} - {formatDateTime(item.child_end)}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'reason',
                  header: 'Violation',
                  render: (item: any) => (
                    <Badge variant="error">
                      {item.violation_type === 'CHILD_STARTS_BEFORE_PARENT'
                        ? 'Child starts before parent'
                        : 'Child ends after parent'}
                    </Badge>
                  ),
                },
              ]}
              data={parentChildViolations}
              keyExtractor={(item: any) => `${item.parent_id}-${item.child_id}`}
              emptyMessage="No time boundary violations found"
            />
          )}
        </Card>
      )}

      {/* External Attendees */}
      {activeTab === 'external' && (
        <Card padding="none">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">External Attendees Report</h3>
            <p className="text-xs text-gray-500 mt-1">Events with more than 5 external attendees</p>
          </div>
          {isLoading ? (
            <SkeletonTable rows={3} />
          ) : (
            <Table
              columns={[
                {
                  key: 'event',
                  header: 'Event',
                  render: (item: any) => (
                    <div>
                      <span className="font-medium">{item.event_name}</span>
                      <div className="text-xs text-gray-500">{item.organization_name}</div>
                    </div>
                  ),
                },
                {
                  key: 'total',
                  header: 'Total Registrations',
                  render: (item: any) => <span>{item.total_registrations}</span>,
                },
                {
                  key: 'users',
                  header: 'Registered Users',
                  render: (item: any) => <span>{item.registered_user_count}</span>,
                },
                {
                  key: 'external',
                  header: 'External Attendees',
                  render: (item: any) => (
                    <Badge variant={item.external_attendee_count > 10 ? 'warning' : 'info'}>
                      {item.external_attendee_count}
                    </Badge>
                  ),
                },
              ]}
              data={externalAttendees}
              keyExtractor={(item) => item.event_id}
              emptyMessage="No events with external attendees above threshold"
            />
          )}
        </Card>
      )}
    </div>
  );
}
