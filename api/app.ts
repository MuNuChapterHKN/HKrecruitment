import express from 'express';
import * as http from 'http';

if (process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}

import cors from 'cors';
import {CommonRoutesConfig} from './src/common/common.routes.config';
import {ApplicantRoutes} from './src/applicant/applicant.routes.config';
import debug from 'debug';
import {applicantRepository} from "./src/applicant/applicant.repository";
import {mySequelize} from "./src/dbconfig/dbconnector";
import {applicantModel} from "./src/applicant/applicant.model";
import {personModel} from "./src/person/person.model";

const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = 3000;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

app.use(express.json());
app.use(cors());

const myPersonModel = personModel(mySequelize)
const myApplicantModel = applicantModel(mySequelize, myPersonModel)
const myApplicantRepository = applicantRepository(myApplicantModel, myPersonModel)

app.applicantRepository = myApplicantRepository

routes.push(new ApplicantRoutes(app));

const runningMessage = `Server running at http://localhost:${port}`;
app.get('/health', (req: express.Request, res: express.Response) => {
    res.status(200).send(runningMessage)
});

server.listen(port, () => {
    routes.forEach((route: CommonRoutesConfig) => {
        debugLog(`Routes configured for ${route.getName()}`);
    });
    console.log(runningMessage);
});
