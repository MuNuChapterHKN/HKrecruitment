import {
  RecruitmentSession,
  RecruitmentSessionState,
} from '@hkrecruitment/shared';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRecruitmentSessionDto
  implements Partial<RecruitmentSession>
{
  @ApiProperty({ required: false })
  state?: RecruitmentSessionState;

  @ApiProperty({ required: false })
  slotDuration?: number;

  @ApiProperty({ required: false })
  interviewStart?: Date;

  @ApiProperty({ required: false })
  interviewEnd?: Date;

  @ApiProperty({ required: false, isArray: true })
  days?: Date[];
}
