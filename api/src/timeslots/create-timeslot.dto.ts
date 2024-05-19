import { TimeSlot } from '@hkrecruitment/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Availability } from 'src/availability/availability.entity';
import { RecruitmentSession } from 'src/recruitment-session/recruitment-session.entity';

export class CreateTimeSlotDto implements Partial<TimeSlot> {
  @ApiProperty() //
  start: Date;

  @ApiProperty()
  end: Date;

  @ApiProperty()
  recruitmentSession: RecruitmentSession;
}
