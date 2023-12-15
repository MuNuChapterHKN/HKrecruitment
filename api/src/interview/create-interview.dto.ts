import { Interview } from '@hkrecruitment/shared';
import { User } from '../users/user.entity'
import { ApiProperty } from '@nestjs/swagger';


export class CreateInterviewDto implements Partial<Interview> {
  
  @ApiProperty()
  notes: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  id_timeslot: number;

  @ApiProperty()
  id_application: number;

  @ApiProperty()
  interviewer_1: User;

  @ApiProperty()
  interviewer_2: User;

  @ApiProperty({ required: false })
  optional_interviewer?: User; 
}
