import * as path from 'path';

import { env } from '../env';
import { swaggerScraper } from '@lib/swagger-scraper/index';
import fs from 'fs';

export const swaggerLoader = async () => {
    if (env.swagger.enabled) {
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

        return swaggerFile;
    }
};
