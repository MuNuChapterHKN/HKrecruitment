import {Applicant} from "../datatypes/entities";

export interface ApplicantPost extends Applicant{
  id: never;
}
