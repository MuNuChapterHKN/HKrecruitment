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
  } from '@nestjs/common';
import { RecruitmentSessionService } from './recruitment-session.service';
import { createRecruitmentSessionSchema, RecruitmentSession, RecruitmentSessionState, updateRecruitmentSessionSchema } from '@hkrecruitment/shared/recruitment-session';
import { Action, AppAbility, checkAbility } from "@hkrecruitment/shared"
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
} from '@nestjs/swagger';
import { CheckPolicies } from 'src/authorization/check-policies.decorator';
import { CreateRecruitmentSessionDto } from './create-recruitment-session.dto';
import { UpdateRecruitmentSessionDto } from './update-recruitment-session.dto';
import * as Joi from 'joi';
import { Ability } from 'src/authorization/ability.decorator';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';
import { plainToClass } from 'class-transformer';
import { RecruitmentSessionResponseDto } from './recruitment-session-response.dto';

@ApiBearerAuth()
@ApiTags('recruitment-session')
@Controller('recruitment-session')
export class RecruitmentSessionController {
    constructor(private readonly recruitmentSessionService: RecruitmentSessionService) {}
  
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
    async createRecruitmentSession(@Body() rSess: CreateRecruitmentSessionDto): Promise<RecruitmentSession> {
        return this.recruitmentSessionService.createRecruitmentSession({...rSess});
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
      const session = await this.recruitmentSessionService.findRecruitmentSessionById(sessionId);
      
      if (session === null) throw new NotFoundException();
  
      const sessionToCheck = {
        ...updateRecruitmentSession,
        sessionId: session.id,
      };
      if (
        !checkAbility(ability, Action.Update, sessionToCheck, 'RecruitmentSession', [
          'applicantId',
        ])
      )
        throw new ForbiddenException();
  
      const updatedRecruitmentSession = await this.recruitmentSessionService.updateRecruitmentSession(
        {
          ...session,
          ...updateRecruitmentSession,
          lastModified: new Date(),
        },
      );
  
      return plainToClass(RecruitmentSessionResponseDto, updatedRecruitmentSession);
    }


}