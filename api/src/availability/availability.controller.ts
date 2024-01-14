import {
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
  @Patch()
  @JoiValidate({
    body: updateAvailabilitySchema,
  })
  async updateAvailability(@Body() body: Availability): Promise<Availability> {
    const test = await this.findAvailabilityById(body.id);
    if (test) {
      const res = await this.availabilityService.updateAvailability(test, body);
      if (res) {
        return res;
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
