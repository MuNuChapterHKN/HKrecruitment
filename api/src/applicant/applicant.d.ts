import {Applicant} from "../datatypes/entities";
import {Gender} from "../datatypes/enums";

export type ApplicantPost = {
    image: string;
    name: string;
    surname: string;
    sex: Gender;
    email: string;
    phone_no: string;
    id: string;
    birth_date: string;
    telegram_uid?: string;
    how_know_HKN: string;
}
export interface ApplicantRepositoryInterface {
    add: (applicant: Applicant) => Promise<Applicant>
    getAll: () => Promise<Applicant[]>
}
