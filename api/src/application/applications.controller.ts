import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Application } from './application.entity';
import { ApplicationsService } from './applications.service';
import {
  Action,
  AppAbility,
  checkAbility,
  createUserSchema,
  Role,
  updateUserSchema,
} from '@hkrecruitment/shared';
import { CreateApplicationDto } from './create-application.dto';
import { JoiValidate } from '../joi-validation/joi-validate.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import * as Joi from 'joi';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { Ability } from 'src/authorization/ability.decorator';

@ApiBearerAuth()
@ApiTags('applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationsService: ApplicationsService) {}
}
