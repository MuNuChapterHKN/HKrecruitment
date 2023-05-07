import {
  Application,
  ApplicationState,
  ApplicationType,
  LangLevel,
} from '@hkrecruitment/shared';
import { ApiProperty } from '@nestjs/swagger';
import {
  BscApplication,
  MscApplication,
  PhdApplication,
} from './application.entity';

class CreateBscApplicationDto extends BscApplication {
  @ApiProperty()
  bscStudyPath: string;

  @ApiProperty()
  bscAcademicYear: number;

  @ApiProperty()
  bscGradesAvg: number;

  @ApiProperty()
  cfu: number;

  @ApiProperty({ type: 'string', format: 'binary' })
  grades: any;
}

class CreateMscApplicationDto extends MscApplication {
  @ApiProperty({ required: false })
  bscStudyPath: string;

  @ApiProperty({ required: false })
  bscGradesAvg: number;

  @ApiProperty()
  mscAcademicYear: number;

  @ApiProperty()
  mscStudyPath: string;

  @ApiProperty()
  mscGradesAvg: number;

  @ApiProperty()
  cfu: number;

  @ApiProperty({ type: 'string', format: 'binary' })
  grades: any;
}

class CreatePhdApplicationDto extends PhdApplication {
  @ApiProperty()
  mscStudyPath: string;

  @ApiProperty()
  phdDescription: string;
}

export class CreateApplicationDto implements Partial<Application> {
  @ApiProperty({ enum: ApplicationType })
  type: ApplicationType;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  cv: any;

  @ApiProperty({ enum: LangLevel })
  itaLevel: LangLevel;

  // @ApiProperty()
  // availability: TimeSlot;

  @ApiProperty({ required: false })
  bscApplication?: CreateBscApplicationDto;

  @ApiProperty({ required: false })
  mscApplication?: CreateMscApplicationDto;

  @ApiProperty({ required: false })
  phdApplication?: CreatePhdApplicationDto;

  /* Internal fields */

  state?: ApplicationState;

  submission?: Date;

  lastModified?: Date;

  applicantId?: string;
}

export function flattenApplication(
  application: CreateApplicationDto,
): Application {
  let newApplication: Application = {
    ...application,
    ...application.bscApplication,
    ...application.mscApplication,
    ...application.phdApplication,
  };
  delete newApplication.bscApplication;
  delete newApplication.mscApplication;
  delete newApplication.phdApplication;
  switch (newApplication.type) {
    case ApplicationType.BSC:
      return newApplication as BscApplication;
    case ApplicationType.MSC:
      return newApplication as MscApplication;
    case ApplicationType.PHD:
      return newApplication as PhdApplication;
  }
}
