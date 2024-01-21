import { RecruitmentSession } from '@hkrecruitment/shared/recruitment-session';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecruitmentSessionDto
  implements Partial<RecruitmentSession>
{
  @ApiProperty()
  slotDuration: number;

  @ApiProperty()
  interviewStart: Date;

  @ApiProperty()
  interviewEnd: Date;

  @ApiProperty()
  days: [Date];
}
