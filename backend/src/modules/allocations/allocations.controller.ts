import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AllocationsService } from './allocations.service';
import { CreateAllocationDto } from './dto';

@Controller('allocations')
export class AllocationsController {
  constructor(private readonly allocationsService: AllocationsService) {}

  @Post()
  create(@Body() dto: CreateAllocationDto) {
    return this.allocationsService.create(dto);
  }

  @Get()
  findByEvent(@Query('eventId', ParseUUIDPipe) eventId: string) {
    return this.allocationsService.findByEvent(eventId);
  }

  @Get('resource/:resourceId')
  findByResource(@Param('resourceId', ParseUUIDPipe) resourceId: string) {
    return this.allocationsService.findByResource(resourceId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.allocationsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.allocationsService.remove(id);
  }
}
