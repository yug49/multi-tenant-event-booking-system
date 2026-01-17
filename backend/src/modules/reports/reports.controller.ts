import { Controller, Get, Post, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /api/reports/double-booked-users
   * Find all users who are double-booked across overlapping events
   */
  @Get('double-booked-users')
  async getDoubleBookedUsers(
    @Query('organizationId') organizationId?: string,
  ) {
    return this.reportsService.getDoubleBookedUsers(organizationId);
  }

  /**
   * GET /api/reports/resource-violations
   * Get all resource constraint violations
   */
  @Get('resource-violations')
  async getResourceViolations(
    @Query('organizationId') organizationId?: string,
  ) {
    return this.reportsService.getAllResourceViolations(organizationId);
  }

  /**
   * GET /api/reports/resource-violations/shareable
   * Get over-allocated shareable resources
   */
  @Get('resource-violations/shareable')
  async getShareableViolations() {
    return this.reportsService.getOverAllocatedShareableResources();
  }

  /**
   * GET /api/reports/resource-violations/exclusive
   * Get double-booked exclusive resources
   */
  @Get('resource-violations/exclusive')
  async getExclusiveViolations() {
    return this.reportsService.getDoubleBookedExclusiveResources();
  }

  /**
   * GET /api/reports/resource-violations/consumable
   * Get over-allocated consumable resources
   */
  @Get('resource-violations/consumable')
  async getConsumableViolations() {
    return this.reportsService.getOverAllocatedConsumables();
  }

  /**
   * GET /api/reports/resource-utilization
   * Get resource utilization metrics
   */
  @Get('resource-utilization')
  async getResourceUtilization(
    @Query('organizationId') organizationId?: string,
  ) {
    return this.reportsService.getResourceUtilization(organizationId);
  }

  /**
   * GET /api/reports/peak-concurrent-usage
   * Get peak concurrent usage for shareable resources
   */
  @Get('peak-concurrent-usage')
  async getPeakConcurrentUsage() {
    return this.reportsService.getPeakConcurrentUsage();
  }

  /**
   * GET /api/reports/parent-child-violations
   * Find parent events whose child sessions violate time boundaries
   */
  @Get('parent-child-violations')
  async getParentChildViolations(
    @Query('organizationId') organizationId?: string,
  ) {
    return this.reportsService.getParentChildTimeViolations(organizationId);
  }

  /**
   * GET /api/reports/external-attendees
   * List events with external attendees exceeding threshold
   */
  @Get('external-attendees')
  async getExternalAttendeeViolations(
    @Query('threshold', new DefaultValuePipe(5), ParseIntPipe) threshold: number,
    @Query('organizationId') organizationId?: string,
  ) {
    return this.reportsService.getExternalAttendeeThresholdViolations(threshold, organizationId);
  }

  /**
   * POST /api/reports/refresh-utilization-view
   * Refresh the materialized view for resource utilization
   */
  @Post('refresh-utilization-view')
  async refreshUtilizationView() {
    await this.reportsService.refreshUtilizationView();
    return { message: 'Materialized view refreshed successfully' };
  }

  /**
   * GET /api/reports/utilization-view
   * Get utilization metrics from materialized view
   */
  @Get('utilization-view')
  async getUtilizationFromView() {
    return this.reportsService.getUtilizationFromView();
  }
}
