import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReportsService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Find all users who are double-booked across overlapping events
   * Uses interval overlap logic: (A.start < B.end) AND (A.end > B.start)
   */
  async getDoubleBookedUsers(): Promise<any[]> {
    const query = `
      SELECT DISTINCT
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        e1.id AS event1_id,
        e1.name AS event1_name,
        e1.start_time AS event1_start,
        e1.end_time AS event1_end,
        e2.id AS event2_id,
        e2.name AS event2_name,
        e2.start_time AS event2_start,
        e2.end_time AS event2_end
      FROM users u
      INNER JOIN event_registrations r1 ON r1.user_id = u.id
      INNER JOIN event_registrations r2 ON r2.user_id = u.id
      INNER JOIN events e1 ON e1.id = r1.event_id
      INNER JOIN events e2 ON e2.id = r2.event_id
      WHERE e1.id < e2.id
        AND e1.start_time < e2.end_time
        AND e1.end_time > e2.start_time
      ORDER BY u.name, e1.start_time
    `;
    return this.dataSource.query(query);
  }

  /**
   * Find all events with over-allocated shareable resources
   * (concurrent usage exceeds max_concurrent_usage)
   */
  async getOverAllocatedShareableResources(): Promise<any[]> {
    const query = `
      SELECT
        r.id AS resource_id,
        r.name AS resource_name,
        r.max_concurrent_usage,
        e.id AS event_id,
        e.name AS event_name,
        e.start_time,
        e.end_time,
        concurrent_count
      FROM resources r
      INNER JOIN (
        SELECT
          ra1.resource_id,
          ra1.event_id,
          COUNT(*) AS concurrent_count
        FROM resource_allocations ra1
        INNER JOIN events e1 ON e1.id = ra1.event_id
        INNER JOIN resource_allocations ra2 ON ra2.resource_id = ra1.resource_id
        INNER JOIN events e2 ON e2.id = ra2.event_id
        WHERE ra1.event_id != ra2.event_id
          AND e1.start_time < e2.end_time
          AND e1.end_time > e2.start_time
        GROUP BY ra1.resource_id, ra1.event_id
      ) AS concurrent ON concurrent.resource_id = r.id
      INNER JOIN events e ON e.id = concurrent.event_id
      WHERE r.type = 'SHAREABLE'
        AND concurrent.concurrent_count >= r.max_concurrent_usage
      ORDER BY r.name, e.start_time
    `;
    return this.dataSource.query(query);
  }

  /**
   * Find all events with double-booked exclusive resources
   */
  async getDoubleBookedExclusiveResources(): Promise<any[]> {
    const query = `
      SELECT
        r.id AS resource_id,
        r.name AS resource_name,
        e1.id AS event1_id,
        e1.name AS event1_name,
        e1.start_time AS event1_start,
        e1.end_time AS event1_end,
        e2.id AS event2_id,
        e2.name AS event2_name,
        e2.start_time AS event2_start,
        e2.end_time AS event2_end
      FROM resources r
      INNER JOIN resource_allocations ra1 ON ra1.resource_id = r.id
      INNER JOIN resource_allocations ra2 ON ra2.resource_id = r.id
      INNER JOIN events e1 ON e1.id = ra1.event_id
      INNER JOIN events e2 ON e2.id = ra2.event_id
      WHERE r.type = 'EXCLUSIVE'
        AND ra1.event_id < ra2.event_id
        AND e1.start_time < e2.end_time
        AND e1.end_time > e2.start_time
      ORDER BY r.name, e1.start_time
    `;
    return this.dataSource.query(query);
  }

  /**
   * Find all consumable resources where total allocated exceeds available quantity
   */
  async getOverAllocatedConsumables(): Promise<any[]> {
    const query = `
      SELECT
        r.id AS resource_id,
        r.name AS resource_name,
        r.available_quantity,
        SUM(ra.quantity_used) AS total_allocated,
        SUM(ra.quantity_used) - r.available_quantity AS over_allocation
      FROM resources r
      INNER JOIN resource_allocations ra ON ra.resource_id = r.id
      WHERE r.type = 'CONSUMABLE'
      GROUP BY r.id, r.name, r.available_quantity
      HAVING SUM(ra.quantity_used) > r.available_quantity
      ORDER BY over_allocation DESC
    `;
    return this.dataSource.query(query);
  }

  /**
   * Get all resource constraint violations combined
   */
  async getAllResourceViolations(): Promise<{
    shareableViolations: any[];
    exclusiveViolations: any[];
    consumableViolations: any[];
  }> {
    const [shareableViolations, exclusiveViolations, consumableViolations] = await Promise.all([
      this.getOverAllocatedShareableResources(),
      this.getDoubleBookedExclusiveResources(),
      this.getOverAllocatedConsumables(),
    ]);

    return {
      shareableViolations,
      exclusiveViolations,
      consumableViolations,
    };
  }

  /**
   * Compute resource utilization per organization
   * Includes total hours used, peak concurrent usage, and underutilized resources
   */
  async getResourceUtilization(organizationId?: string): Promise<any[]> {
    const whereClause = organizationId
      ? `WHERE (r.organization_id = $1 OR r.is_global = true)`
      : '';
    const params = organizationId ? [organizationId] : [];

    const query = `
      SELECT
        r.id AS resource_id,
        r.name AS resource_name,
        r.type AS resource_type,
        r.organization_id,
        o.name AS organization_name,
        r.is_global,
        COALESCE(SUM(
          EXTRACT(EPOCH FROM (e.end_time - e.start_time)) / 3600
        ), 0) AS total_hours_used,
        COUNT(ra.id) AS total_allocations,
        CASE 
          WHEN r.type = 'SHAREABLE' THEN r.max_concurrent_usage
          WHEN r.type = 'CONSUMABLE' THEN r.available_quantity
          ELSE 1
        END AS capacity,
        CASE
          WHEN COUNT(ra.id) = 0 THEN 'UNUSED'
          WHEN COUNT(ra.id) < 3 THEN 'UNDERUTILIZED'
          ELSE 'ACTIVE'
        END AS utilization_status
      FROM resources r
      LEFT JOIN organizations o ON o.id = r.organization_id
      LEFT JOIN resource_allocations ra ON ra.resource_id = r.id
      LEFT JOIN events e ON e.id = ra.event_id
      ${whereClause}
      GROUP BY r.id, r.name, r.type, r.organization_id, o.name, r.is_global,
               r.max_concurrent_usage, r.available_quantity
      ORDER BY total_hours_used DESC
    `;

    return this.dataSource.query(query, params);
  }

  /**
   * Calculate peak concurrent usage for shareable resources using window functions
   */
  async getPeakConcurrentUsage(): Promise<any[]> {
    const query = `
      WITH allocation_events AS (
        SELECT
          ra.resource_id,
          e.start_time AS event_time,
          1 AS delta
        FROM resource_allocations ra
        INNER JOIN events e ON e.id = ra.event_id
        INNER JOIN resources r ON r.id = ra.resource_id
        WHERE r.type = 'SHAREABLE'
        UNION ALL
        SELECT
          ra.resource_id,
          e.end_time AS event_time,
          -1 AS delta
        FROM resource_allocations ra
        INNER JOIN events e ON e.id = ra.event_id
        INNER JOIN resources r ON r.id = ra.resource_id
        WHERE r.type = 'SHAREABLE'
      ),
      running_counts AS (
        SELECT
          resource_id,
          event_time,
          SUM(delta) OVER (
            PARTITION BY resource_id 
            ORDER BY event_time, delta DESC
          ) AS concurrent_count
        FROM allocation_events
      )
      SELECT
        r.id AS resource_id,
        r.name AS resource_name,
        r.max_concurrent_usage,
        COALESCE(MAX(rc.concurrent_count), 0) AS peak_concurrent_usage,
        CASE
          WHEN COALESCE(MAX(rc.concurrent_count), 0) > r.max_concurrent_usage THEN 'EXCEEDED'
          WHEN COALESCE(MAX(rc.concurrent_count), 0) = r.max_concurrent_usage THEN 'AT_CAPACITY'
          ELSE 'OK'
        END AS status
      FROM resources r
      LEFT JOIN running_counts rc ON rc.resource_id = r.id
      WHERE r.type = 'SHAREABLE'
      GROUP BY r.id, r.name, r.max_concurrent_usage
      ORDER BY peak_concurrent_usage DESC
    `;
    return this.dataSource.query(query);
  }

  /**
   * Find parent events whose child sessions violate time boundaries
   * Uses recursive CTE to traverse event hierarchy
   */
  async getParentChildTimeViolations(): Promise<any[]> {
    const query = `
      WITH RECURSIVE event_hierarchy AS (
        -- Base case: all events with a parent
        SELECT
          e.id AS child_id,
          e.name AS child_name,
          e.start_time AS child_start,
          e.end_time AS child_end,
          e.parent_event_id,
          p.id AS root_parent_id,
          p.name AS root_parent_name,
          p.start_time AS parent_start,
          p.end_time AS parent_end,
          1 AS depth
        FROM events e
        INNER JOIN events p ON p.id = e.parent_event_id
        
        UNION ALL
        
        -- Recursive case: traverse up the hierarchy
        SELECT
          eh.child_id,
          eh.child_name,
          eh.child_start,
          eh.child_end,
          p.parent_event_id,
          p.id AS root_parent_id,
          p.name AS root_parent_name,
          p.start_time AS parent_start,
          p.end_time AS parent_end,
          eh.depth + 1
        FROM event_hierarchy eh
        INNER JOIN events p ON p.id = eh.parent_event_id
        WHERE eh.parent_event_id IS NOT NULL
      )
      SELECT DISTINCT
        root_parent_id AS parent_id,
        root_parent_name AS parent_name,
        parent_start,
        parent_end,
        child_id,
        child_name,
        child_start,
        child_end,
        depth AS hierarchy_depth,
        CASE
          WHEN child_start < parent_start THEN 'CHILD_STARTS_BEFORE_PARENT'
          WHEN child_end > parent_end THEN 'CHILD_ENDS_AFTER_PARENT'
          ELSE 'UNKNOWN'
        END AS violation_type
      FROM event_hierarchy
      WHERE child_start < parent_start OR child_end > parent_end
      ORDER BY parent_name, child_name
    `;
    return this.dataSource.query(query);
  }

  /**
   * List events with external attendees exceeding a threshold
   */
  async getExternalAttendeeThresholdViolations(threshold: number = 5): Promise<any[]> {
    const query = `
      SELECT
        e.id AS event_id,
        e.name AS event_name,
        e.start_time,
        e.end_time,
        e.capacity,
        o.id AS organization_id,
        o.name AS organization_name,
        COUNT(CASE WHEN r.external_email IS NOT NULL THEN 1 END) AS external_attendee_count,
        COUNT(CASE WHEN r.user_id IS NOT NULL THEN 1 END) AS registered_user_count,
        COUNT(r.id) AS total_registrations
      FROM events e
      INNER JOIN organizations o ON o.id = e.organization_id
      LEFT JOIN event_registrations r ON r.event_id = e.id
      GROUP BY e.id, e.name, e.start_time, e.end_time, e.capacity, o.id, o.name
      HAVING COUNT(CASE WHEN r.external_email IS NOT NULL THEN 1 END) > $1
      ORDER BY external_attendee_count DESC
    `;
    return this.dataSource.query(query, [threshold]);
  }

  /**
   * Create or refresh the materialized view for resource utilization
   */
  async refreshUtilizationView(): Promise<void> {
    await this.dataSource.query(`REFRESH MATERIALIZED VIEW IF EXISTS mv_resource_utilization`);
  }

  /**
   * Get utilization metrics from materialized view
   */
  async getUtilizationFromView(): Promise<any[]> {
    const query = `
      SELECT * FROM mv_resource_utilization
      ORDER BY total_hours_used DESC
    `;
    return this.dataSource.query(query);
  }
}
