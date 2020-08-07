import basicAuth from 'express-basic-auth';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import * as path from 'path';
import * as swaggerUi from 'swagger-ui-express';
import { env } from '../env';
import { swaggerScraper } from '@lib/swagger-scraper/index';

export const swaggerLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    if (settings && env.swagger.enabled) {
        const expressApp = settings.getData('express_app');
        const swaggerFile = require(path.join(__dirname, '..', env.swagger.file));

        swaggerFile.info = {
            title: env.app.name,
            description: env.app.description,
            version: env.app.version,
        };

        swaggerFile.servers = [
            {
                url: `${env.app.schema}://${env.app.host}:${env.app.port}${env.app.routePrefix}`,
            },
        ];

        if (env.swagger.scraper) {
            const swaggerScrap = await swaggerScraper();
            swaggerFile.tags = swaggerScrap.tag;

            swaggerFile.paths = swaggerScrap.paths;

            swaggerFile.components.requestBodies = swaggerFile.components.schemas = {};
        }

        expressApp.use(
            env.swagger.route,
            env.swagger.username ? basicAuth({
                users: {
                    [`${env.swagger.username}`]: env.swagger.password,
                },
                challenge: true,
            }) : (req, res, next) => next(),
            swaggerUi.serve,
            swaggerUi.setup(swaggerFile)
        );

    }
};
