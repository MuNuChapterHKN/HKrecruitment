import express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import * as http from 'http';
import cors from 'cors';
if (process.env.NODE_ENV === 'local') {
    require('dotenv').config();
}
import {CommonRoutesConfig} from './src/common/common.routes.config';
import {RegisterRoutes} from './build/routes';

import bodyParser from "body-parser";

import debug from 'debug';
import {ErrorHandler} from "./src/ErrorHandler";


const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3000;
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');

app.use(express.json());
app.use(cors());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

RegisterRoutes(app);
app.use(ErrorHandler.handleError);

const swaggerDocument = require('../build/swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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
