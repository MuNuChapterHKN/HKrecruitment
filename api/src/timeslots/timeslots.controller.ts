import { Controller, Get } from '@nestjs/common';
import { TimeSlotsService } from './timeslots.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { TimeSlot } from './timeslot.entity';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { Action } from '@hkrecruitment/shared';

@ApiBearerAuth()
@ApiTags('timeslots')
@Controller('timeslots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @ApiUnauthorizedResponse()
  @CheckPolicies((ability) => ability.can(Action.Read, 'TimeSlot'))
  @Get()
  async findAvailableTimeSlots(): Promise<TimeSlot[]> {
    return await this.timeSlotsService.findAvailableTimeSlots();
  }
}
