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
import { RegistrationsService } from './registrations.service';
import { CreateUserRegistrationDto, CreateExternalRegistrationDto } from './dto';

@Controller('registrations')
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('user')
  registerUser(@Body() dto: CreateUserRegistrationDto) {
    return this.registrationsService.registerUser(dto);
  }

  @Post('external')
  registerExternal(@Body() dto: CreateExternalRegistrationDto) {
    return this.registrationsService.registerExternal(dto);
  }

  @Post(':id/checkin')
  checkin(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrationsService.checkin(id);
  }

  @Get()
  findByEvent(@Query('eventId', ParseUUIDPipe) eventId: string) {
    return this.registrationsService.findByEvent(eventId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrationsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.registrationsService.remove(id);
  }
}
