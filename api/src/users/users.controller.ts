import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { createUserSchema, Role, updateUserSchema } from '@hkrecruitment/shared';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { JoiValidate } from '../joi-validation/joi-validate.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest } from 'src/authorization/authenticated-request.types';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':oauthId')
  async findByOauthId(@Param('oauthId') oauthId: string): Promise<User> {
    const result = await this.usersService.findByOauthId(oauthId);
    if (result === null) {
      throw new NotFoundException();
    }
    return result;
  }

  @Post()
  @JoiValidate(createUserSchema)
  create(@Body() user: CreateUserDto, @Req() req: AuthenticatedRequest): Promise<User> {
    if (req.user.sub !== user.oauthId) {
      throw new ForbiddenException('User cannot create another user');
    }
    return this.usersService.create({...user, role: Role.None});
  }

  @Patch(':oauthId')
  @JoiValidate(updateUserSchema)
  async update(@Param('oauthId') oauthId: string, @Body() updateUser: UpdateUserDto): Promise<User> {
    const user = await this.usersService.findByOauthId(oauthId);
    if (user === null) {
      throw new NotFoundException();
    }
    return this.usersService.update({
      ...user,
      ...updateUser,
    });
  }

  @Delete(':oauthId')
  async delete(@Param('oauthId') oauthId: string): Promise<User> {
    const user = await this.usersService.findByOauthId(oauthId);
    if (user === null) {
      throw new NotFoundException();
    }
    return this.usersService.delete(user);
  }
}
