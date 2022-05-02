import {CommonRoutesConfig} from '../common/common.routes.config';
import pool from '../dbconfig/dbconnector';

import express from 'express';

export class ApplicantRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'ApplicantRoutes');
    }

    configureRoutes() {
        this.app.route(`/applicant`)
            .get(async (req: express.Request, res: express.Response) => {
                console.log(pool);
                const client = await pool.connect();
                const sql = 'SELECT t.* FROM public."Applicant" t';
                await client.query(sql, (err, result) =>{
                    if(err) {
                        console.error('Error executing query', err.stack)
                        res.status(500).send("Server error");
                    } else {

                        res.status(200).send(result.rows);
                    }
                })
                client.release()
            })
            .post((req: express.Request, res: express.Response) => {
                res.status(200).send(`Post to applicant`)
            });
        return this.app;
    }
}
