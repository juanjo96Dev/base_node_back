import { Application } from 'express';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createExpressServer } from 'routing-controllers';

import { authorizationChecker } from '../auth/authorizationChecker';
import { currentUserChecker } from '../auth/currentUserChecker';

import { env } from '@src/env';

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
            const server = expressApp.listen(env.app.port);
            settings.setData('express_server', server);
        }

        settings.setData('express_app', expressApp);
    }
};
