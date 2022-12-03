import {CommonRoutesConfig} from '../../common/common.routes.config';
import express from 'express';

export class Applicant extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'ApplicantRoutes');
    }

    configureRoutes() {
        this.app.route(`/applicant`)
        .get((req: express.Request, res: express.Response) => {
            res.status(200).send(`List of applicants`);
        })
        .post((req: express.Request, res: express.Response) => {
            res.status(200).send(`Post to applicant`);
        });
        return this.app;
    }
}