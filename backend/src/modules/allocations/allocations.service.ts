import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceAllocation } from './resource-allocation.entity';
import { Event } from '../events/event.entity';
import { Resource } from '../resources/resource.entity';
import { CreateAllocationDto } from './dto';

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

    const existing = await this.allocationRepository.findOne({
      where: { eventId: dto.eventId, resourceId: dto.resourceId },
    });
    if (existing) {
      throw new ConflictException('Resource already allocated to this event');
    }

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
}
