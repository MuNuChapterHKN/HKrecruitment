import { Controller, Get, Post } from '@nestjs/common';
import { TimeSlotsService } from './timeslots.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TimeSlot } from './timeslot.entity';

@ApiBearerAuth()
@ApiTags('timeslots')
@Controller('timeslots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @ApiUnauthorizedResponse()
  @Get()
  async findAvailableTimeSlots(): Promise<TimeSlot[]> {
    return await this.timeSlotsService.findAvailableTimeSlots();
  }
}
