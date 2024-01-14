import {
  Availability,
  AvailabilityState,
  TimeSlot,
} from '@hkrecruitment/shared';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/user.entity';

export class CreateAvailabilityDto implements Availability {
  @ApiProperty()
  state: AvailabilityState;
  @ApiProperty()
  lastModified: Date;
  @ApiProperty()
  timeSlot: TimeSlot;
  @ApiProperty()
  user: User;
}
