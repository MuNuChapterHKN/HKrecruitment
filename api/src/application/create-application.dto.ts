import {
  Application,
  ApplicationState,
  LangLevel,
} from '@hkrecruitment/shared';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplicationDto implements Partial<Application> {
  @ApiProperty()
  submission: Date;

  @ApiProperty({ enum: ApplicationState })
  state: ApplicationState;

  @ApiProperty()
  lastModified: Date;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  cv: string;

  @ApiProperty({ enum: LangLevel })
  itaLevel: LangLevel;

  // @ApiProperty()
  // availability: TimeSlot;
}

// TODO: Other types of applications
