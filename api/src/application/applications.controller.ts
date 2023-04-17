import {
  Body,
  Controller,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Application } from './application.entity';
import { ApplicationsService } from './applications.service';
import {
  Action,
  AppAbility,
  ApplicationState,
  checkAbility,
  createApplicationSchema,
  Role,
  updateApplicationSchema,
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
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import * as Joi from 'joi';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { Ability } from 'src/authorization/ability.decorator';
import { ApplicationResponseDto } from './application-response.dto';
import { CreateApplicationDto } from './create-application.dto';
import { UpdateApplicationDto } from './update-application.dto';
import { plainToClass } from 'class-transformer';

@ApiBearerAuth()
@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @ApiQuery({
    name: 'submittedFrom',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'submittedUntil',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    type: 'string',
    enum: Object.values(ApplicationState),
  })
  @JoiValidate({
    query: {
      submittedFrom: Joi.date().iso().optional(),
      submittedUntil: Joi.date().iso().optional(),
      state: Joi.string(),
    },
  })
  async listApplications(
    @Ability() ability: AppAbility,
    @Query('submittedFrom') submittedFrom?: string, // start date for time period
    @Query('submittedUntil') submittedUntil?: string, // end date for time period
    @Query('state') state?: string,
  ): Promise<ApplicationResponseDto[]> {
    const applications = await this.applicationsService.listApplications(
      submittedFrom,
      submittedUntil,
      state,
    );
    return applications
      .filter((application) =>
        checkAbility(ability, Action.Read, application, 'Application'),
      )
      .map((application) => plainToClass(ApplicationResponseDto, application));
  }

  // TODO: Move this to applicants.controller.ts
  // TODO: decide if we need an applicant controller
  // @Get('applicants/:applicant_id/applications')
  // @ApiForbiddenResponse()
  // async listApplicationsOfApplicant(
  //   @Param('applicant_id') applicantId: string,
  // ): Promise<ApplicationResponseDto[]> {
  //   const applications = await this.applicationsService.findByApplicantId(
  //     applicantId,
  //   );
  //   return applications.map((application) => plainToClass(ApplicationResponseDto, application));;
  // }

  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Get(':application_id')
  @JoiValidate({
    param: Joi.number().positive().integer().required().label('application_id'),
    body: Joi.object().forbidden(),
  })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Application'))
  async getApplication(
    @Ability() ability: AppAbility,
    @Param('application_id') applicationId: number,
  ): Promise<ApplicationResponseDto> {
    const application = await this.applicationsService.findByApplicationId(
      applicationId,
    );

    if (!application) throw new NotFoundException();
    if (!checkAbility(ability, Action.Read, application, 'Application'))
      throw new ForbiddenException();

    return plainToClass(ApplicationResponseDto, application);
  }

  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiConflictResponse({
    description: 'User already has a pending application',
  })
  @ApiCreatedResponse()
  @Post('/')
  @JoiValidate({
    body: createApplicationSchema,
  })
  async createApplication(
    @Body() application: CreateApplicationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Application> {
    const ability = req.ability;
    if (!checkAbility(ability, Action.Create, application, 'Application'))
      throw new ForbiddenException();

    // Get the user unique identifier from the request
    const applicantId = req.user.sub;

    // An applicant can have only one application with (state != finalized || state != refused_by_applicant)
    const hasActiveApplication =
      await this.applicationsService.findActiveApplicationByApplicantId(
        applicantId,
      );
    if (hasActiveApplication)
      throw new ConflictException('Your already have a pending application');

    // TODO: Create an Interview and set application.interview_id
    application.submission = new Date();
    application.state = ApplicationState.New;
    application.applicantId = applicantId;
    return await this.applicationsService.createApplication(application);
  }

  @Patch(':application_id')
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiOkResponse()
  @JoiValidate({
    param: Joi.number().positive().integer().required().label('application_id'),
    body: updateApplicationSchema,
  })
  async updateApplication(
    @Param('application_id') applicationId: number,
    @Body() updateApplication: UpdateApplicationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<ApplicationResponseDto> {
    const application = await this.applicationsService.findByApplicationId(
      applicationId,
    );
    if (application === null) throw new NotFoundException();

    const ability = req.ability;
    if (!checkAbility(ability, Action.Update, application, 'Application'))
      throw new ForbiddenException();

    // Applicants can only update status to "refused_by_applicant"
    if (
      req.user.role === Role.Applicant &&
      (updateApplication.state !== ApplicationState.RefusedByApplicant ||
        Object.keys(updateApplication).length !== 1)
    )
      throw new BadRequestException(
        "You can only update your application state to 'refused_by_applicant'",
      );

    const updatedApplication = await this.applicationsService.updateApplication(
      {
        ...application,
        ...updateApplication,
        lastModified: new Date(),
      },
    );

    return plainToClass(ApplicationResponseDto, updatedApplication);
  }
}
