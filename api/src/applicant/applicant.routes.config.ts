import {CommonRoutesConfig} from '../common/common.routes.config';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import {Applicant} from "../datatypes/entities";

export class ApplicantRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'ApplicantRoutes');
    }

    configureRoutes() {
        this.app.route(`/applicant`)
            .get(async (req: express.Request, res: express.Response) => {
                const applicants = await this.app.applicantRepository.getAll()
                res.status(200).json(applicants);

            })
            .post(async (req: express.Request, res: express.Response) => {
                const body = req.body;
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
                const outApplicant = await this.app.applicantRepository.add(applicant).catch((err) =>
                {
                    console.error(err)
                    res.status(500).end()
                })
                res.status(200).json(outApplicant)
            })
        return this.app;
    }
}
