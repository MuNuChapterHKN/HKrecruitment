import {
  Get,
  Param,
  ForbiddenException,
  NotFoundException,
  Controller,
  Patch,
  Body,
  Post,
  Req,
  Delete,
  ConflictException,
} from '@nestjs/common';
import { Interview } from './interview.entity';
import { InterviewService } from './interview.Service';
import { TimeSlotsService } from '../timeslots/timeslots.service';
import { ApplicationsService } from '../application/applications.service';
import { CreateInterviewDto } from './create-interview.dto';
import { UpdateInterviewDto } from './update-interview.dto';
import {
  Action,
  AppAbility,
  checkAbility,
  createInterviewSchema,
  updateInterviewSchema,
} from '@hkrecruitment/shared';
import { JoiValidate } from 'src/joi-validation/joi-validate.decorator';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import * as Joi from 'joi';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { Ability } from 'src/authorization/ability.decorator';

@ApiBearerAuth()
@ApiTags('interview')
@Controller('interview')
export class InterviewController {
  constructor(
    private readonly interviewService: InterviewService,
    private readonly timeSlotService: TimeSlotsService,
    private readonly applicationService: ApplicationsService,
  ) {}

  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Get(':Id')
  @JoiValidate({
    param: Joi.number().required(),
  })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Interview'))
  async findById(
    @Param('Id') Id: number,
    @Ability() ability: AppAbility,
  ): Promise<Interview> {
    const interview = await this.interviewService.findById(Id);
    if (interview === null) {
      throw new NotFoundException();
    }
    if (!checkAbility(ability, Action.Read, interview, 'Interview')) {
      throw new ForbiddenException();
    }
    return interview;
  }

  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Delete(':Id')
  @JoiValidate({
    param: Joi.number().required(),
  })
  @CheckPolicies((ability) => ability.can(Action.Delete, 'Interview'))
  async delete(
    @Param('Id') Id: number,
    @Ability() ability: AppAbility,
  ): Promise<Interview> {
    const interview = await this.interviewService.findById(Id);
    if (interview === null) {
      throw new NotFoundException();
    }
    return this.interviewService.delete(interview);
  }

  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Patch(':Id')
  @JoiValidate({
    body: updateInterviewSchema,
    param: Joi.number().required(),
  })
  @CheckPolicies((ability) => ability.can(Action.Update, 'Interview'))
  async update(
    @Param('Id') Id: number,
    @Body() updateInterview: UpdateInterviewDto,
    @Ability() ability: AppAbility,
    @Req() req: AuthenticatedRequest,
  ): Promise<Interview> {
    const interview = await this.interviewService.findById(Id);
    if (interview === null) {
      throw new NotFoundException();
    }
    return this.interviewService.update({
      ...interview,
      ...updateInterview,
    });
  }

  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @Post()
  @JoiValidate({
    body: createInterviewSchema,
  })
  @CheckPolicies((ability) => ability.can(Action.Create, 'Interview'))
  async create(
    @Body() interview: CreateInterviewDto,
    @Ability() ability: AppAbility,
    @Req() req: AuthenticatedRequest,
  ): Promise<Interview> {
    const Id = req.user.sub;
    const timeslot = await this.timeSlotService.findById(interview.timeslot_id);
    if (timeslot === null) {
      throw new NotFoundException();
    }
    const application =
      await this.applicationService.findLastApplicationByActiveUserId(Id);
    if (application === null) {
      throw new NotFoundException();
    }
    try {
      return this.interviewService.create(interview, application, timeslot);
    } catch {
      throw new ConflictException();
    }
  }
}
