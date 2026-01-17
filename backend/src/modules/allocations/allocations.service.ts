import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceAllocation } from './resource-allocation.entity';
import { Event } from '../events/event.entity';
import { Resource } from '../resources/resource.entity';
import { CreateAllocationDto } from './dto';
import { ResourceType } from '../../common/enums';

@Injectable()
export class AllocationsService {
  constructor(
    @InjectRepository(ResourceAllocation)
    private readonly allocationRepository: Repository<ResourceAllocation>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  async create(dto: CreateAllocationDto): Promise<ResourceAllocation> {
    const event = await this.eventRepository.findOne({
      where: { id: dto.eventId },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${dto.eventId} not found`);
    }

    const resource = await this.resourceRepository.findOne({
      where: { id: dto.resourceId },
    });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${dto.resourceId} not found`);
    }

    // Organization scoping: resource must belong to event's org or be global
    this.validateOrganizationScope(event, resource);

    const existing = await this.allocationRepository.findOne({
      where: { eventId: dto.eventId, resourceId: dto.resourceId },
    });
    if (existing) {
      throw new ConflictException('Resource already allocated to this event');
    }

    // Validate based on resource type
    await this.validateResourceAllocation(event, resource, dto.quantityUsed);

    const allocation = this.allocationRepository.create({
      eventId: dto.eventId,
      resourceId: dto.resourceId,
      quantityUsed: dto.quantityUsed,
    });

    return this.allocationRepository.save(allocation);
  }

  async findByEvent(eventId: string): Promise<ResourceAllocation[]> {
    return this.allocationRepository.find({
      where: { eventId },
      relations: ['resource', 'event'],
      order: { allocatedAt: 'ASC' },
    });
  }

  async findByResource(resourceId: string): Promise<ResourceAllocation[]> {
    return this.allocationRepository.find({
      where: { resourceId },
      relations: ['resource', 'event'],
      order: { allocatedAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ResourceAllocation> {
    const allocation = await this.allocationRepository.findOne({
      where: { id },
      relations: ['resource', 'event'],
    });
    if (!allocation) {
      throw new NotFoundException(`Allocation with ID ${id} not found`);
    }
    return allocation;
  }

  async remove(id: string): Promise<void> {
    const allocation = await this.findOne(id);
    await this.allocationRepository.remove(allocation);
  }

  private validateOrganizationScope(event: Event, resource: Resource): void {
    if (!resource.isGlobal && resource.organizationId !== event.organizationId) {
      throw new BadRequestException(
        'Resource does not belong to the event organization',
      );
    }
  }

  private async validateResourceAllocation(
    event: Event,
    resource: Resource,
    quantityUsed?: number,
  ): Promise<void> {
    switch (resource.type) {
      case ResourceType.EXCLUSIVE:
        await this.validateExclusiveResource(event, resource);
        break;
      case ResourceType.SHAREABLE:
        await this.validateShareableResource(event, resource);
        break;
      case ResourceType.CONSUMABLE:
        await this.validateConsumableResource(resource, quantityUsed);
        break;
    }
  }

  private async validateExclusiveResource(event: Event, resource: Resource): Promise<void> {
    // Find all allocations for this resource
    const allocations = await this.allocationRepository.find({
      where: { resourceId: resource.id },
      relations: ['event'],
    });

    // Check for time overlap
    for (const allocation of allocations) {
      const existingEvent = allocation.event;
      if (
        event.startTime < existingEvent.endTime &&
        event.endTime > existingEvent.startTime
      ) {
        throw new ConflictException(
          `Exclusive resource "${resource.name}" is already allocated to "${existingEvent.name}" during this time`,
        );
      }
    }
  }

  private async validateShareableResource(event: Event, resource: Resource): Promise<void> {
    // Find all allocations for this resource with overlapping events
    const allocations = await this.allocationRepository.find({
      where: { resourceId: resource.id },
      relations: ['event'],
    });

    // Count concurrent usage during this event's time window
    let concurrentCount = 0;
    for (const allocation of allocations) {
      const existingEvent = allocation.event;
      if (
        event.startTime < existingEvent.endTime &&
        event.endTime > existingEvent.startTime
      ) {
        concurrentCount++;
      }
    }

    // Adding this allocation would make it concurrentCount + 1
    if (concurrentCount + 1 > (resource.maxConcurrentUsage || 0)) {
      throw new ConflictException(
        `Shareable resource "${resource.name}" has reached max concurrent usage (${resource.maxConcurrentUsage})`,
      );
    }
  }

  private async validateConsumableResource(
    resource: Resource,
    quantityUsed?: number,
  ): Promise<void> {
    if (!quantityUsed || quantityUsed <= 0) {
      throw new BadRequestException(
        'Quantity must be specified for consumable resources',
      );
    }

    // Sum total quantity already allocated
    const result = await this.allocationRepository
      .createQueryBuilder('allocation')
      .select('COALESCE(SUM(allocation.quantityUsed), 0)', 'totalUsed')
      .where('allocation.resourceId = :resourceId', { resourceId: resource.id })
      .getRawOne();

    const totalUsed = parseInt(result.totalUsed, 10);
    const available = resource.availableQuantity || 0;

    if (totalUsed + quantityUsed > available) {
      throw new ConflictException(
        `Insufficient quantity for "${resource.name}". Available: ${available - totalUsed}, Requested: ${quantityUsed}`,
      );
    }
  }
}
