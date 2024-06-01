import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Interview } from '@hkrecruitment/shared';
import { User } from '../users/user.entity';
import { TimeSlot } from '../timeslots/timeslot.entity';
import { Application } from '../application/application.entity';

export class UpdateInterviewDto implements Partial<Interview> {
  @ApiProperty({ required: false })
  notes: string;

  @ApiProperty({ required: false })
  createdAt: Date;

  @ApiProperty({ required: false })
  timeslot: TimeSlot;

  @ApiProperty({ required: false })
  application: Application;

  @ApiProperty({ required: false })
  interviewer1: User;

  @ApiProperty({ required: false })
  interviewer2: User;

  @ApiProperty({ required: false })
  optional_interviewer?: User;
}
