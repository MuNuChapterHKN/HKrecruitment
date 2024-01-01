import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import {
  Action,
  checkAbility,
  insertAvailabilitySchema,
  updateAvailabilitySchema,
} from '@hkrecruitment/shared';
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
  ApiBadGatewayResponse,
} from '@nestjs/swagger';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { Availability } from './availability.entity';
import Joi from 'joi';

@ApiBearerAuth()
@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @ApiNotFoundResponse()
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiBadGatewayResponse()
  async listAvailabilities(): Promise<Availability[]> {
    const matches = await this.availabilityService.listAvailabilities();
    if (matches.length == 0) {
      throw new NotFoundException();
    }
    return matches;
  }

  @ApiNotFoundResponse()
  @ApiOkResponse()
  @ApiBadGatewayResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @JoiValidate({
    param: Joi.number().positive().integer().required(),
  })
  async findAvailabilityById(id: number): Promise<Availability> {
    const match = await this.availabilityService.findAvailabilityById(id);
    if (!match) {
      throw new NotFoundException();
    }
    return match;
  }

  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiBadGatewayResponse()
  @CheckPolicies((ability) => ability.can(Action.Create, 'Availability'))
  @Post()
  @JoiValidate({
    body: insertAvailabilitySchema,
  })
  async createAvailability(@Body() body: Availability): Promise<boolean> {
    const res = await this.availabilityService.createAvailability(body);
    if (res.identifiers.length > 0) {
      return true;
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
  @Patch()
  @JoiValidate({
    body: updateAvailabilitySchema,
  })
  async updateAvailability(@Body() body: Availability): Promise<boolean> {
    const test = await this.findAvailabilityById(body.id);
    if (test) {
      const res = await this.availabilityService.updateAvailability(body);
      if (
        res.affected != undefined &&
        res.affected != null &&
        res.affected > 0
      ) {
        return true;
      } else {
        throw new ForbiddenException();
      }
    } else {
      throw new NotFoundException();
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
  async deleteAvailability(@Param() id: number): Promise<boolean> {
    const test = await this.findAvailabilityById(id);
    if (test) {
      const res = await this.availabilityService.deleteAvailability(id);
      if (
        res.affected != undefined &&
        res.affected != null &&
        res.affected > 0
      ) {
        return true;
      } else {
        throw new ForbiddenException();
      }
    } else {
      throw new NotFoundException();
    }
  }
}
