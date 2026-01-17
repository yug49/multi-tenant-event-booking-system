import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from './resource.entity';
import { CreateResourceDto, UpdateResourceDto } from './dto';
import { ResourceType } from '../../common/enums';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
  ) {}

  async create(dto: CreateResourceDto): Promise<Resource> {
    this.validateResourceType(dto);

    const resource = this.resourceRepository.create({
      name: dto.name,
      description: dto.description,
      type: dto.type,
      organizationId: dto.isGlobal ? null : dto.organizationId,
      isGlobal: dto.isGlobal || false,
      maxConcurrentUsage: dto.maxConcurrentUsage,
      availableQuantity: dto.availableQuantity,
    });

    return this.resourceRepository.save(resource);
  }

  async findAll(organizationId?: string): Promise<Resource[]> {
    if (organizationId) {
      return this.resourceRepository.find({
        where: [{ organizationId }, { isGlobal: true }],
        relations: ['organization'],
        order: { createdAt: 'DESC' },
      });
    }
    return this.resourceRepository.find({
      relations: ['organization'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceRepository.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return resource;
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource> {
    const resource = await this.findOne(id);
    Object.assign(resource, dto);
    return this.resourceRepository.save(resource);
  }

  async remove(id: string): Promise<void> {
    const resource = await this.findOne(id);
    await this.resourceRepository.remove(resource);
  }

  private validateResourceType(dto: CreateResourceDto): void {
    if (dto.type === ResourceType.SHAREABLE && !dto.maxConcurrentUsage) {
      throw new BadRequestException(
        'Shareable resources must have maxConcurrentUsage',
      );
    }
    if (dto.type === ResourceType.CONSUMABLE && dto.availableQuantity === undefined) {
      throw new BadRequestException(
        'Consumable resources must have availableQuantity',
      );
    }
    if (dto.isGlobal && dto.organizationId) {
      throw new BadRequestException(
        'Global resources cannot belong to an organization',
      );
    }
    if (!dto.isGlobal && !dto.organizationId) {
      throw new BadRequestException(
        'Non-global resources must belong to an organization',
      );
    }
  }
}
