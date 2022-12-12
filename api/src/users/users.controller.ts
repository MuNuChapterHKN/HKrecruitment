import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { createUserSchema, Person, Role, updateUserSchema } from '@hkrecruitment/shared';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';
import { JoiValidate } from '../joi-validation/joi-validate.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<User[]> {
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
  create(@Body() user: CreateUserDto): Promise<User> {
    return this.usersService.create({...user, role: Role.None});
  }

  @Patch(':oauthId')
  @JoiValidate(updateUserSchema)
  async update(@Param('oauthId') oauthId: string, @Body() updateUser: UpdateUserDto): Promise<User> {
    const user = await this.usersService.findByOauthId(oauthId);
    if (user) {
      return this.usersService.update({
        ...user,
        ...updateUser,
      });
    }
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
