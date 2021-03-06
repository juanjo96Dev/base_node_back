import { Application } from 'express';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createExpressServer } from 'routing-controllers';
import morgan from 'morgan';
import path from 'path';

import { authorizationChecker } from '../auth/authorizationChecker';
import { currentUserChecker } from '../auth/currentUserChecker';
import dash from 'appmetrics-dash';

import { env } from '../env';
import fs from 'fs';

export const expressLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {

    const connection = settings.getData('connection');

    const port = env.app.port;

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

        if ( env.morgan.enabled ) {
            // Logs files
            if (!fs.existsSync('logs')) {
                fs.mkdirSync('logs');
            }
            const accessLogStream = fs.createWriteStream(path.join(__dirname, '../../', 'logs', 'performance.csv'), { flags: 'a' });
            expressApp.use(morgan(':method\,:url\,:status\,:response-time\,:res[content-length]', { stream: accessLogStream }));
        }

        const server = expressApp.listen(port);
        settings.setData('express_server', server);
    }

    settings.setData('express_app', expressApp);
};
