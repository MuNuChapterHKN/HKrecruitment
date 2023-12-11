import { RecruitmentSession, RecruitmentSessionState } from "@hkrecruitment/shared/recruitment-session";
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecruitmentSessionDto implements RecruitmentSession {
    @ApiProperty()
    state: RecruitmentSessionState;
  
    @ApiProperty()
    slotDuration: number;
  
    @ApiProperty()
    interviewStart: Date;
  
    @ApiProperty()
    interviewEnd: Date;
  
    @ApiProperty()
    days: [Date];
  
    @ApiProperty()
    createdAt: Date;
  
    @ApiProperty()
    lastModified: Date;
}