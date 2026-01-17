import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto, UpdateEventDto } from './dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async create(dto: CreateEventDto): Promise<Event> {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (dto.parentEventId) {
      await this.validateParentChild(dto.parentEventId, startTime, endTime);
    }

    const event = this.eventRepository.create({
      name: dto.name,
      description: dto.description,
      startTime,
      endTime,
      capacity: dto.capacity,
      organizationId: dto.organizationId,
      parentEventId: dto.parentEventId,
    });

    return this.eventRepository.save(event);
  }

  async findAll(
    organizationId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Event[]> {
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organization', 'organization')
      .leftJoinAndSelect('event.parentEvent', 'parentEvent');

    if (organizationId) {
      queryBuilder.andWhere('event.organizationId = :organizationId', {
        organizationId,
      });
    }

    if (startDate) {
      queryBuilder.andWhere('event.startTime >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('event.endTime <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    queryBuilder.orderBy('event.startTime', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organization', 'parentEvent'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async findChildren(parentEventId: string): Promise<Event[]> {
    return this.eventRepository.find({
      where: { parentEventId },
      relations: ['organization'],
      order: { startTime: 'ASC' },
    });
  }

  async update(id: string, dto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);

    const startTime = dto.startTime ? new Date(dto.startTime) : event.startTime;
    const endTime = dto.endTime ? new Date(dto.endTime) : event.endTime;

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const parentEventId =
      dto.parentEventId !== undefined ? dto.parentEventId : event.parentEventId;

    if (parentEventId) {
      await this.validateParentChild(parentEventId, startTime, endTime);
    }

    Object.assign(event, {
      ...dto,
      startTime,
      endTime,
      parentEventId,
    });

    return this.eventRepository.save(event);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.eventRepository.remove(event);
  }

  private async validateParentChild(
    parentEventId: string,
    childStart: Date,
    childEnd: Date,
  ): Promise<void> {
    const parent = await this.eventRepository.findOne({
      where: { id: parentEventId },
    });

    if (!parent) {
      throw new NotFoundException(`Parent event with ID ${parentEventId} not found`);
    }

    if (childStart < parent.startTime || childEnd > parent.endTime) {
      throw new BadRequestException(
        'Child event must be fully contained within parent event time',
      );
    }
  }
}
