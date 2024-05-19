import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { TimeSlotsService } from '../timeslots/timeslots.service';
import { UsersService } from '../users/users.service';
import {
  Action,
  AppAbility,
  AvailabilityState,
  insertAvailabilitySchema,
} from '@hkrecruitment/shared';
import { JoiValidate } from '../joi-validation/joi-validate.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiTags,
  ApiNoContentResponse,
  ApiBadGatewayResponse,
  ApiConflictResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { Availability } from './availability.entity';
import * as Joi from 'joi';
import { CreateAvailabilityDto } from './create-availability.dto';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import { Ability } from 'src/authorization/ability.decorator';

@ApiBearerAuth()
@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly timeSlotsService: TimeSlotsService,
    private readonly userService: UsersService,
  ) {}

  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiBadGatewayResponse()
  @ApiConflictResponse()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Availability'))
  @Post()
  @JoiValidate({
    param: Joi.number()
      .positive()
      .integer()
      .required()
      .label('availability_id'),
    body: insertAvailabilitySchema,
  })
  async createAvailability(
    @Body() availabilityDto: CreateAvailabilityDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Availability> {
    /* Verify timeslot exists */
    const timeSlot = await this.timeSlotsService.findById(
      availabilityDto.timeSlotId,
    );
    if (!timeSlot) throw new NotFoundException('Timeslot not found');

    /* Verify user exists */
    const user = await this.userService.findByOauthId(req.user.sub);
    if (!user) throw new NotFoundException('User not found');

    /********** DISABLED BEACUSE findByUserAndTimeSlot HAS AN ERROR ************/
    /* Verify availability for timeslot does not already exist */
    /*    const existing = await this.availabilityService.findByUserAndTimeSlot(
      user,
      timeSlot,
    );
    if (existing)
      throw new ConflictException(
        'Availability already exists for this timeslot',
      );
*/
    const availability = {
      timeSlot: timeSlot,
      state: AvailabilityState.Free,
    } as Availability;
    const result = await this.availabilityService.createAvailability(
      availability,
    );
    if (!result) throw new ForbiddenException();
    return result;
  }

  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiNoContentResponse()
  @ApiUnprocessableEntityResponse()
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Availability'))
  @Delete(':availability_id')
  @JoiValidate({
    param: Joi.number()
      .positive()
      .integer()
      .required()
      .label('availability_id'),
  })
  async deleteAvailability(
    @Ability() ability: AppAbility,
    @Param('availability_id') availabilityId: number,
    @Req() req: AuthenticatedRequest,
  ): Promise<Availability> {
    // Check if availability exists
    const availability = await this.availabilityService.findById(
      availabilityId,
    );
    if (!availability) throw new NotFoundException();

    // Check if user has permission to delete availability
    if (
      ability.cannot(Action.Delete, 'Availability') ||
      availability.user.oauthId !== req.user.sub
    )
      throw new ForbiddenException();

    return await this.availabilityService.deleteAvailability(availabilityId);
  }
}
