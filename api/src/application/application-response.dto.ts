import {
  Application,
  ApplicationState,
  ApplicationType,
  LangLevel,
} from '@hkrecruitment/shared';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ApplicationResponseDto implements Partial<Application> {
  @Expose() id: number;
  @Expose() submission: string;
  @Expose() state: ApplicationState;
  @Expose() itaLevel: LangLevel;
  @Expose() type: ApplicationType;

  @Expose() bscStudyPath?: string;
  @Expose() bscAcademicYear?: number;
  @Expose() bscGradesAvg?: number;
  @Expose() cfu?: number;

  @Expose() mscStudyPath?: string;
  @Expose() mscGradesAvg?: number;
  @Expose() mscAcademicYear?: number;

  @Expose() phdDescription?: string;

  // @Expose()
  //   applicant: ApplicantDto
}
