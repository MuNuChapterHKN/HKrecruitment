import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import {
  Action,
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
} from '@nestjs/swagger';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { Availability } from './availability.entity';
import Joi from 'joi';
import { CreateAvailabilityDto } from './create-availability.dto';

@ApiBearerAuth()
@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiBadGatewayResponse()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Availability'))
  @Post()
  @JoiValidate({
    body: insertAvailabilitySchema,
  })
  async createAvailability(
    @Body() body: CreateAvailabilityDto,
  ): Promise<Availability> {
    const res = await this.availabilityService.createAvailability(body);
    if (res) {
      return res;
    } else {
      throw new ForbiddenException();
    }
  }

  @ApiNotFoundResponse()
  @ApiNoContentResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiBadGatewayResponse()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Availability'))
  @Delete()
  @JoiValidate({
    param: Joi.number().positive().integer().required(),
  })
  async deleteAvailability(@Param() id: number): Promise<Availability> {
    const test = await this.findAvailabilityById(id);
    if (test) {
      const res = await this.availabilityService.deleteAvailability(test);
      if (res) {
        return res;
      } else {
        throw new ForbiddenException();
      }
    } else {
      throw new NotFoundException();
    }
  }
}
