import { RecruitmentSession } from '@hkrecruitment/shared';
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

  @ApiProperty({ isArray: true })
  days: Date[];
}
