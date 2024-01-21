import {
  Body,
  Controller,
  NotFoundException,
  ConflictException,
  Param,
  Post,
  Delete,
  Patch,
  ForbiddenException,
  Get,
} from '@nestjs/common';
import { RecruitmentSessionService } from './recruitment-session.service';
import {
  createRecruitmentSessionSchema,
  RecruitmentSession,
  RecruitmentSessionState,
  updateRecruitmentSessionSchema,
} from '@hkrecruitment/shared/recruitment-session';
import { Action, AppAbility, checkAbility } from '@hkrecruitment/shared';
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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { CreateRecruitmentSessionDto } from './create-recruitment-session.dto';
import { UpdateRecruitmentSessionDto } from './update-recruitment-session.dto';
import * as Joi from 'joi';
import { Ability } from 'src/authorization/ability.decorator';
import { plainToClass } from 'class-transformer';
import { RecruitmentSessionResponseDto } from './recruitment-session-response.dto';

@ApiBearerAuth()
@ApiTags('recruitment-session')
@Controller('recruitment-session')
export class RecruitmentSessionController {
  constructor(
    private readonly recruitmentSessionService: RecruitmentSessionService,
  ) {}

  // FIND ACTIVE RECRUITMENT SESSION
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @Get()
  @CheckPolicies((ability) => ability.can(Action.Read, 'RecruitmentSession'))
  async findActive(
    @Ability() ability: AppAbility,
  ): Promise<RecruitmentSession> {
    const recruitmentSession =
      await this.recruitmentSessionService.findActiveRecruitmentSession();
    if (recruitmentSession === null) {
      throw new NotFoundException();
    }

    if (
      !checkAbility(
        ability,
        Action.Read,
        recruitmentSession,
        'RecruitmentSession',
      )
    ) {
      throw new ForbiddenException();
    }

    return recruitmentSession;
  }

  // CREATE NEW RECRUITMENT SESSION
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiConflictResponse({
    description: 'The recruitment session cannot be created', //
  })
  @ApiCreatedResponse()
  @JoiValidate({
    body: createRecruitmentSessionSchema,
  })
  @CheckPolicies((ability) => ability.can(Action.Create, 'RecruitmentSession'))
  @Post()
  async createRecruitmentSession(
    @Body() recruitmentSession: CreateRecruitmentSessionDto,
  ): Promise<RecruitmentSession> {
    // there should be only one active recruitment session at a time
    const hasActiveRecruitmentSession =
      await this.recruitmentSessionService.findActiveRecruitmentSession();
    if (hasActiveRecruitmentSession)
      throw new ConflictException(
        'There is already an active recruitment session',
      );

    return this.recruitmentSessionService.createRecruitmentSession({
      ...recruitmentSession,
    });
  }

  // UPDATE A RECRUITMENT SESSION
  @Patch(':session_id')
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiConflictResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse()
  @JoiValidate({
    param: Joi.number().positive().integer().required().label('session_id'),
    body: updateRecruitmentSessionSchema,
  })
  @CheckPolicies((ability) => ability.can(Action.Update, 'RecruitmentSession'))
  async updateRecruitmentSession(
    @Param('session_id') sessionId: number,
    @Body() updateRecruitmentSession: UpdateRecruitmentSessionDto,
    @Ability() ability: AppAbility,
  ): Promise<RecruitmentSessionResponseDto> {
    const recruitmentSession =
      await this.recruitmentSessionService.findRecruitmentSessionById(
        sessionId,
      );

    if (recruitmentSession === null) throw new NotFoundException();

    const sessionToCheck = {
      ...updateRecruitmentSession,
      sessionId: recruitmentSession.id,
    };
    if (
      !checkAbility(
        ability,
        Action.Update,
        sessionToCheck,
        'RecruitmentSession',
      )
    )
      throw new ForbiddenException();

    if (updateRecruitmentSession.hasOwnProperty('state')) {
      // There should be only one active recruitment session at a time
      if (updateRecruitmentSession.state === RecruitmentSessionState.Active) {
        const currentlyActiveRecruitmentSession =
          await this.recruitmentSessionService.findActiveRecruitmentSession();
        if (
          currentlyActiveRecruitmentSession &&
          currentlyActiveRecruitmentSession.id !== recruitmentSession.id // It's ok to set 'Active' to the (already) active recruitment session
        )
          throw new ConflictException(
            'There is already an active recruitment session',
          );
      } else if (
        updateRecruitmentSession.state === RecruitmentSessionState.Concluded
      ) {
        // Recruitment session can't be set to concluded if it has pending interviews
        const hasPendingInterviews =
          await this.recruitmentSessionService.sessionHasPendingInterviews(
            recruitmentSession,
          );
        if (hasPendingInterviews)
          throw new ConflictException(
            "Recruitment session can't be set to inactive because it has pending interviews",
          );
      }
    }

    const updatedRecruitmentSession =
      await this.recruitmentSessionService.updateRecruitmentSession({
        ...recruitmentSession,
        ...updateRecruitmentSession,
        lastModified: new Date(),
      });

    return plainToClass(
      RecruitmentSessionResponseDto,
      updatedRecruitmentSession,
    );
  }

  // DELETE A RECRUITMENT SESSION
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @ApiOkResponse()
  @ApiConflictResponse()
  @ApiNoContentResponse()
  @CheckPolicies((ability) => ability.can(Action.Delete, 'RecruitmentSession'))
  @Delete('/:recruitment_session_id')
  @JoiValidate({
    param: Joi.number()
      .positive()
      .integer()
      .required()
      .label('recruitment_session_id'),
  })
  async deleteRecruitmentSession(
    @Param('recruitment_session_id') recruitmentSessionId: number,
  ): Promise<RecruitmentSessionResponseDto> {
    // Check if recruitment session exists
    const toRemove =
      await this.recruitmentSessionService.findRecruitmentSessionById(
        recruitmentSessionId,
      );
    if (!toRemove) throw new NotFoundException('Recruitment session not found');

    // Check if recruitment session has pending interviews
    if (toRemove.state !== RecruitmentSessionState.Concluded) {
      const hasPendingInterviews =
        await this.recruitmentSessionService.sessionHasPendingInterviews(
          toRemove,
        );
      if (hasPendingInterviews)
        throw new ConflictException(
          "Recruitment session can't be deleted because it has pending interviews",
        );
    }

    // Delete recruitment session
    const deletedRecruitmentSession =
      await this.recruitmentSessionService.deletRecruitmentSession(toRemove);

    return plainToClass(
      RecruitmentSessionResponseDto,
      deletedRecruitmentSession,
    );
  }
}
