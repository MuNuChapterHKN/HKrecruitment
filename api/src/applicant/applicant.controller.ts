import {v4 as uuidv4} from 'uuid';
import {Applicant} from "../datatypes/entities";
import {Body, Controller, Get, Path, Post, Route, SuccessResponse,} from "tsoa";
import {inject} from "inversify";
import {ApplicantRepository} from './applicant.repository'
import {provideSingleton} from "../util";
import {ApplicantPost} from "./applicant";

@Route("applicant")
@provideSingleton(ApplicantController)
export class ApplicantController {

    constructor(@inject(ApplicantRepository) private applicantRepository: ApplicantRepository) {
    }

    @Get()
    public async getApplicants(): Promise<Applicant[]> {
        return await this.applicantRepository.getAll();
    }

    @SuccessResponse("201", "Created")
    @Post()
    public async createApplicant(
        @Body() body: ApplicantPost
    ): Promise<void> {
        console.log(body)
        const applicant: Applicant = {
            id: uuidv4(),
            birth_date: body.birth_date,
            telegram_uid: body.telegram_uid,
            how_know_HKN: body.how_know_HKN,
            name: body.name,
            surname: body.surname,
            email: body.email,
            phone_no: body.phone_no,
            image: body.image,
            sex: body.sex,
        }
        await this.applicantRepository.add(applicant)
        return;
    }
}
