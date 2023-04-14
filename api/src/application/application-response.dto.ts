import { ApplicationState } from '@hkrecruitment/shared';
import { Exclude, Expose } from 'class-transformer';
// import { ApplicantDto } from "../applicant/ApplicantDto"

@Exclude()
export class ApplicationResponseDto {
  @Expose() id: number;
  @Expose() submission: string;
  @Expose() state: ApplicationState;
  // @Expose()
  //   applicant: ApplicantDto
}
