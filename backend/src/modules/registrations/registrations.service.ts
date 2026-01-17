import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventRegistration } from './event-registration.entity';
import { Event } from '../events/event.entity';
import { CreateUserRegistrationDto, CreateExternalRegistrationDto } from './dto';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(EventRegistration)
    private readonly registrationRepository: Repository<EventRegistration>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
  ) {}

  async registerUser(dto: CreateUserRegistrationDto): Promise<EventRegistration> {
    await this.validateEventCapacity(dto.eventId);

    const existing = await this.registrationRepository.findOne({
      where: { eventId: dto.eventId, userId: dto.userId },
    });
    if (existing) {
      throw new ConflictException('User already registered for this event');
    }

    const registration = this.registrationRepository.create({
      eventId: dto.eventId,
      userId: dto.userId,
      externalEmail: null,
    });

    return this.registrationRepository.save(registration);
  }

  async registerExternal(dto: CreateExternalRegistrationDto): Promise<EventRegistration> {
    await this.validateEventCapacity(dto.eventId);

    const existing = await this.registrationRepository.findOne({
      where: { eventId: dto.eventId, externalEmail: dto.externalEmail },
    });
    if (existing) {
      throw new ConflictException('Email already registered for this event');
    }

    const registration = this.registrationRepository.create({
      eventId: dto.eventId,
      userId: null,
      externalEmail: dto.externalEmail,
    });

    return this.registrationRepository.save(registration);
  }

  async checkin(id: string): Promise<EventRegistration> {
    const registration = await this.findOne(id);

    if (registration.checkinTime) {
      throw new BadRequestException('Already checked in');
    }

    registration.checkinTime = new Date();
    return this.registrationRepository.save(registration);
  }

  async findByEvent(eventId: string): Promise<EventRegistration[]> {
    return this.registrationRepository.find({
      where: { eventId },
      relations: ['user', 'event'],
      order: { registeredAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EventRegistration> {
    const registration = await this.registrationRepository.findOne({
      where: { id },
      relations: ['user', 'event'],
    });
    if (!registration) {
      throw new NotFoundException(`Registration with ID ${id} not found`);
    }
    return registration;
  }

  async remove(id: string): Promise<void> {
    const registration = await this.findOne(id);
    await this.registrationRepository.remove(registration);
  }

  private async validateEventCapacity(eventId: string): Promise<void> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const registrationCount = await this.registrationRepository.count({
      where: { eventId },
    });

    if (registrationCount >= event.capacity) {
      throw new BadRequestException('Event is at full capacity');
    }
  }
}
