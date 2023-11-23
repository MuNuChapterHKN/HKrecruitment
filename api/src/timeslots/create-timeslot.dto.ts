import { TimeSlot } from '@hkrecruitment/shared';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTimeSlotDto implements TimeSlot {
  @ApiProperty()
  start: Date;

  @ApiProperty()
  end: Date;
}