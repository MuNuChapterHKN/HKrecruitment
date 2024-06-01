import { Interview } from '@hkrecruitment/shared';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInterviewDto implements Partial<Interview> {
  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  timeslot_id: number;
}
