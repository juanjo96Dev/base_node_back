import { Application } from 'express';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createExpressServer } from 'routing-controllers';
const morgan = require('morgan');
const path = require('path');

import { authorizationChecker } from '@auth/authorizationChecker';
import { currentUserChecker } from '@auth/currentUserChecker';
const dash = require('appmetrics-dash');

import { env } from '@src/env';
const fs = require('fs');

export const expressLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {

    console.log('settings check');
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
            if (!fs.existsSync('logs')) {
                fs.mkdirSync('logs');
            }
            const accessLogStream = fs.createWriteStream(path.join(__dirname, '../../', 'logs', 'performance.csv'), { flags: 'a' });
            expressApp.use(morgan(':method\,:url\,:status\,:response-time\,:res[content-length]', { stream: accessLogStream }));

            const server = expressApp.listen(env.app.port, () => {
                console.log(`Express using port: ${env.app.port}`);
            });
            settings.setData('express_server', server);
        }

        settings.setData('express_app', expressApp);
        console.log('express load');
    }
};
