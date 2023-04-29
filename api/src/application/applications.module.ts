import { Module } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './application.entity';
import { UsersService } from 'src/users/users.service';
import { User } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application]),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [ApplicationsService, UsersService],
  controllers: [ApplicationsController],
  exports: [ApplicationsService, UsersService],
})
export class ApplicationsModule {}
