import { Application } from 'express';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createExpressServer } from 'routing-controllers';
import dash from 'appmetrics-dash';
import morgan from 'morgan';
import path from 'path';

import { authorizationChecker } from '../auth/authorizationChecker';
import { currentUserChecker } from '../auth/currentUserChecker';

import { env } from '@src/env';
import fs from 'fs-extra';

export const expressLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        const connection = settings.getData('connection');

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
            fs.mkdirsSync('logs');
            const accessLogStream = fs.createWriteStream(path.join(__dirname, '../../', 'logs', 'performance.csv'), { flags: 'a' });
            expressApp.use(morgan(':method\,:url\,:status\,:response-time\,:res[content-length]', { stream: accessLogStream }));

            // // 404 error
            // expressApp.use((req, res, next) => {
            //     res.status(404).json('Error 404: Not found');
            // });

            const server = expressApp.listen(env.app.port);
            settings.setData('express_server', server);
        }

        settings.setData('express_app', expressApp);
    }
};
