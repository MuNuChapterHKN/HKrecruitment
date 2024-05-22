import { Module } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { InterviewController } from './interview.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interview } from './interview.entity';
import { RecruitmentSessionModule } from 'src/recruitment-session/recruitment-session.module';

@Module({
  imports: [TypeOrmModule.forFeature([Interview]), RecruitmentSessionModule],
  providers: [InterviewService],
  controllers: [InterviewController],
  exports: [InterviewService],
})
export class InterviewModule {}
