import {
  Body,
  Controller,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Param,
  Post,
  Delete,
  Req,
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
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import { plainToClass } from 'class-transformer';
import { RecruitmentSessionResponseDto } from './recruitment-session-response.dto';
import { User } from 'src/users/user.entity';

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

    if (!checkAbility(ability, Action.Read, recruitmentSession, 'Person')) {
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
  @ApiOkResponse()
  @JoiValidate({
    param: Joi.number().positive().integer().required().label('session_id'),
    body: updateRecruitmentSessionSchema,
  })
  async updateRecruitmentSession(
    @Param('session_id') sessionId: number,
    @Body() updateRecruitmentSession: UpdateRecruitmentSessionDto,
    @Ability() ability: AppAbility,
    @Req() req: AuthenticatedRequest,
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
        ['applicantId'],
      )
    )
      throw new ForbiddenException();

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
  @ApiNoContentResponse()
  @CheckPolicies((ability) => ability.can(Action.Delete, 'RecruitmentSession'))
  @Delete('/:recruitment_session_id')
  @JoiValidate({
    param: Joi.number().positive().integer().required().label('time_slot_id'),
  })
  async deleteRecruitmentSessionById(
    @Param('recruitment_session_id') recruitmentSessionId: number,
  ): Promise<RecruitmentSession> {
    // check if it exists
    const toRemove =
      await this.recruitmentSessionService.findRecruitmentSessionById(
        recruitmentSessionId,
      );
    if (!toRemove) throw new NotFoundException('Recruitment session not found');

    // delete it
    return await this.recruitmentSessionService.deletRecruitmentSession(
      toRemove,
    );
  }
}
