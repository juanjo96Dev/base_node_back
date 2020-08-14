import { Application } from 'express';
import { createExpressServer } from 'routing-controllers';
import morgan from 'morgan';
import path from 'path';

import { authorizationChecker } from '../auth/authorizationChecker';
import { currentUserChecker } from '../auth/currentUserChecker';
import dash from 'appmetrics-dash';

import { env } from '@src/env';
import fs from 'fs';
import basicAuth from 'express-basic-auth';
import * as swaggerUi from 'swagger-ui-express';
import { typeormLoader } from './typeormLoader';
import { swaggerLoader } from './swaggerLoader';

export const expressLoader = async () => {
    const connection = await typeormLoader();

    const expressApp: Application = createExpressServer({
        cors: true,
        classTransformer: true,
        defaultErrorHandler: false,
        routePrefix: env.app.routePrefix,
        middlewares: env.app.dirs.middlewares,
        controllers: env.app.dirs.controllers,

        /**
         * Authorization
         */

        authorizationChecker: authorizationChecker(connection),
        currentUserChecker: currentUserChecker(connection),
    });

    if (!env.isTest) {

        if (env.metrics.enabled) {
            dash.attach({url: '/metrics'});
        }

        // Logs files
        if (!fs.existsSync('logs')) {
            fs.mkdirSync('logs');
        }
        const accessLogStream = fs.createWriteStream(path.join(__dirname, '../../', 'logs', 'performance.csv'), { flags: 'a' });
        expressApp.use(morgan(':method\,:url\,:status\,:response-time\,:res[content-length]', { stream: accessLogStream }));

        // swagger
        expressApp.use(
            env.swagger.route,
            env.swagger.username ? basicAuth({
                users: {
                    [`${env.swagger.username}`]: env.swagger.password,
                },
                challenge: true,
            }) : (req, res, next) => next(),
            swaggerUi.serve,
            swaggerUi.setup(await swaggerLoader())
        );

        expressApp.listen(env.app.port);
    }

};
