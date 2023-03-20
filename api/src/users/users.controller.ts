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
import { User } from './user.entity';
import { UsersService } from './users.service';
import {
  Action,
  AppAbility,
  checkAbility,
  createUserSchema,
  Role,
  updateUserSchema,
} from '@hkrecruitment/shared';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
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
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiUnauthorizedResponse()
  @Get()
  async findAll(@Ability() ability: AppAbility): Promise<User[]> {
    const users = await this.usersService.findAll();
    return users.filter((u) => checkAbility(ability, Action.Read, u, 'Person'));
  }

  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  @Get(':oauthId')
  @JoiValidate({
    param: Joi.string().required(),
  })
  @CheckPolicies((ability) => ability.can(Action.Read, 'Person'))
  async findByOauthId(
    @Param('oauthId') oauthId: string,
    @Ability() ability: AppAbility,
  ): Promise<User> {
    const user = await this.usersService.findByOauthId(oauthId);
    if (user === null) {
      throw new NotFoundException();
    }

    if (!checkAbility(ability, Action.Read, user, 'Person')) {
      throw new ForbiddenException();
    }

    return user;
  }

  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Post()
  @JoiValidate({
    body: createUserSchema.append({ oauthId: Joi.string().required() }),
  })
  create(
    @Body() user: CreateUserDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<User> {
    const ability = req.ability;
    if (!checkAbility(ability, Action.Create, user, 'Person')) {
      throw new ForbiddenException();
    }
    return this.usersService.create({ ...user, role: Role.None });
  }

  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Patch(':oauthId')
  @JoiValidate({
    body: updateUserSchema,
    param: Joi.string().required(),
  })
  async update(
    @Param('oauthId') oauthId: string,
    @Body() updateUser: UpdateUserDto,
    @Ability() ability: AppAbility,
  ): Promise<User> {
    const user = await this.usersService.findByOauthId(oauthId);
    if (user === null) {
      throw new NotFoundException();
    }

    if (
      !checkAbility(
        ability,
        Action.Update,
        { ...updateUser, oauthId },
        'Person',
      )
    ) {
      throw new ForbiddenException();
    }

    return this.usersService.update({
      ...user,
      ...updateUser,
    });
  }

  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Delete(':oauthId')
  @JoiValidate({
    param: Joi.string().required(),
  })
  async delete(
    @Param('oauthId') oauthId: string,
    @Ability() ability: AppAbility,
  ): Promise<User> {
    const user = await this.usersService.findByOauthId(oauthId);
    if (user === null) {
      throw new NotFoundException();
    }

    if (!checkAbility(ability, Action.Delete, user, 'Person')) {
      throw new ForbiddenException();
    }

    return this.usersService.delete(user);
  }
}
