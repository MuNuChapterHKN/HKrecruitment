import { Module } from '@nestjs/common';
import { RecruitmentSessionService } from './recruitment-session.service';
import { RecruitmentSessionController } from './recruitment-session.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitmentSession } from './recruitment-session.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([RecruitmentSession]), UsersModule],
  providers: [RecruitmentSessionService],
  controllers: [RecruitmentSessionController],
  exports: [RecruitmentSessionService],
})
export class RecruitmentSessionModule {}
