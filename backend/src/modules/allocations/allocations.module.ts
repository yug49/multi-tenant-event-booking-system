import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceAllocation } from './resource-allocation.entity';
import { Event } from '../events/event.entity';
import { Resource } from '../resources/resource.entity';
import { AllocationsService } from './allocations.service';
import { AllocationsController } from './allocations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ResourceAllocation, Event, Resource])],
  controllers: [AllocationsController],
  providers: [AllocationsService],
  exports: [AllocationsService],
})
export class AllocationsModule {}
