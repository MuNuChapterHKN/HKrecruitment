import {
  Body,
  Controller,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { TimeSlotsService } from './timeslots.service';
import { Action, createTimeSlotSchema, TimeSlot } from '@hkrecruitment/shared';
import { JoiValidate } from '../joi-validation/joi-validate.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiConflictResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { CreateTimeSlotDto } from './create-timeslot.dto';
import * as Joi from 'joi';

@ApiBearerAuth()
@ApiTags('timeslots')
@Controller('timeslots')
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiConflictResponse({
    description: 'The time slot overlaps with existing time slots',
  })
  @ApiCreatedResponse()
  @JoiValidate({
    body: createTimeSlotSchema,
  })
  @CheckPolicies((ability) => ability.can(Action.Create, 'TimeSlot'))
  @Post()
  async createTimeSlot(@Body() timeSlot: CreateTimeSlotDto): Promise<TimeSlot> {
    const startDate = new Date(timeSlot.start);
    const endDate = new Date(timeSlot.end);

    // Check duration
    const durationInMinutes =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    if (durationInMinutes < 30) {
      throw new BadRequestException(
        'The duration of the time slot must be at least 30 minutes',
      );
    } else if (durationInMinutes > 60) {
      throw new BadRequestException(
        'The duration of the time slot must be at most 60 minutes',
      );
    }

    // Check overlapping timeslots
    const overlappingTimeSlots =
      await this.timeSlotsService.countOverlappingTimeSlots(startDate, endDate);
    if (overlappingTimeSlots > 0)
      throw new ConflictException(
        'The time slot overlaps with existing time slots',
      );

    return await this.timeSlotsService.createTimeSlot(timeSlot);
  }

  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse()
  @ApiNoContentResponse()
  @CheckPolicies((ability) => ability.can(Action.Delete, 'TimeSlot'))
  @Delete('/:time_slot_id')
  @JoiValidate({
    param: Joi.number().positive().integer().required().label('time_slot_id'),
  })
  async deleteTimeSlot(
    @Param('time_slot_id') timeSlotId: number,
  ): Promise<TimeSlot> {
    const timeSlot = await this.timeSlotsService.findById(timeSlotId);
    if (!timeSlot) throw new NotFoundException('Time slot not found');
    return await this.timeSlotsService.deleteTimeSlot(timeSlot);
  }
}
