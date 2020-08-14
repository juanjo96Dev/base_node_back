import basicAuth from 'express-basic-auth';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import * as path from 'path';
import * as swaggerUi from 'swagger-ui-express';
import { env } from '../env';
import { swaggerScraper } from '@lib/swagger-scraper/index';
import fs from 'fs';

export const swaggerLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    if (settings && env.swagger.enabled) {
        const expressApp = settings.getData('express_app');
        const pahFile = path.join(__dirname, '..', env.swagger.file);
        const swaggerFile = require(pahFile);

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

        if (env.swagger.scraper && process.env.NODE_ENV !== 'production') {
            const swaggerScrap = await swaggerScraper();
            if (Object.keys(swaggerScrap.paths).length > 0) {
                swaggerFile.tags = swaggerScrap.tag;

                const diff = JSON.stringify(swaggerFile.paths) !== JSON.stringify(swaggerScrap.paths);

                swaggerFile.paths = swaggerScrap.paths;

                swaggerFile.components.requestBodies = swaggerFile.components.schemas = {};

                if (diff) {
                    fs.writeFile(pahFile, JSON.stringify(swaggerFile), (err) => {
                        if (err) {
                            return console.error(err);
                        }
                        console.log('swagger.json rebuild!');
                      });
                }
            }

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
