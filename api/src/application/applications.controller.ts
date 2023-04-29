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
  UploadedFiles,
  UseInterceptors,
  HttpStatus,
  HttpException,
  UnprocessableEntityException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Application } from './application.entity';
import { ApplicationsService } from './applications.service';
import {
  Action,
  AppAbility,
  ApplicationState,
  ApplicationType,
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
  ApiConsumes,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import * as Joi from 'joi';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { Ability } from 'src/authorization/ability.decorator';
import { ApplicationResponseDto } from './application-response.dto';
import { CreateApplicationDto } from './create-application.dto';
import { UpdateApplicationDto } from './update-application.dto';
import { plainToClass } from 'class-transformer';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GDriveStorage } from 'src/google/GDrive/GDriveStorage';
import { UsersService } from 'src/users/users.service';

// TODO: Move to a config file? (maybe a file not in the .gitignore?)
const MAX_UPLOAD_SIZE = 1024 * 1024 * 4; // 4MB

@ApiBearerAuth()
@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly usersService: UsersService,
  ) {}

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
  @ApiUnprocessableEntityResponse({
    description: 'Invalid "cv" or "grades" file type or size',
  })
  @ApiConflictResponse({
    description: 'User already has a pending application',
  })
  @ApiCreatedResponse()
  @ApiConsumes('multipart/form-data')
  @JoiValidate({
    body: createApplicationSchema,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'cv', maxCount: 1 },
        { name: 'grades', maxCount: 1 },
      ],
      {
        limits: {
          fileSize: MAX_UPLOAD_SIZE,
        },
        fileFilter: (
          req: Request,
          file: Express.Multer.File,
          callback: Function,
        ) => {
          if (file.mimetype !== 'application/pdf')
            return callback(
              new HttpException(
                `${file.fieldname} is not a valid .pdf document`,
                HttpStatus.UNPROCESSABLE_ENTITY,
              ),
              false,
            );
          return callback(null, true);
        },
      },
    ),
  )
  @Post('/')
  async createApplication(
    @UploadedFiles()
    files: {
      cv: Express.Multer.File[];
      grades?: Express.Multer.File[];
    },
    @Body() application: CreateApplicationDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Application> {
    if (!files || !files.cv) {
      throw new UnprocessableEntityException('CV file is required');
    }

    if (
      // @ts-ignore
      req.body.type !== ApplicationType.PHD &&
      files.grades === undefined
    ) {
      // grades are required for non-phd applications
      throw new UnprocessableEntityException('Grades file is required');
    }

    const ability = req.ability;
    if (!checkAbility(ability, Action.Create, application, 'Application'))
      throw new ForbiddenException();

    // Get the user unique identifier from the request
    const applicantId = req.user.sub;
    const today = new Date();

    // Get applicant full name
    const applicant = await this.usersService.findByOauthId(applicantId);
    if (!applicant) throw new NotFoundException('Applicant not found'); // Just in case
    const applicantFullName = `${applicant.firstName} ${applicant.lastName}`;

    // An applicant can have only one application with (state != finalized || state != refused_by_applicant)
    const hasActiveApplication =
      await this.applicationsService.findActiveApplicationByApplicantId(
        applicantId,
      );
    if (hasActiveApplication)
      throw new ConflictException('Your already have a pending application');

    // Save files to Google Drive
    try {
      const storage = new GDriveStorage();
      const applicationsFolder = await storage.getFolderByName('applications');
      const formattedDatetime = today.toLocaleString('en-US', {
        hour12: false,
      });
      const fileName = `${application.type}_${applicantFullName}_${formattedDatetime}`;
      // TODO: Create a folder for each applicant? Give it a unique name
      // Save CV
      await storage.insertFile(
        `CV_${fileName}`,
        files.cv[0].buffer,
        applicationsFolder,
      );
      // Save grades
      if (files.grades) {
        await storage.insertFile(
          `Grades_${fileName}`,
          files.grades[0].buffer,
          applicationsFolder,
        );
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }

    // TODO: Create an Interview and set application.interview_id
    application.submission = today;
    application.state = ApplicationState.New;
    application.applicantId = applicantId;

    // return await this.applicationsService.createApplication(application);
    return null;
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
