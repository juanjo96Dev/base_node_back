import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createConnection, getConnectionOptions } from 'typeorm';

import { env } from '@src/env';

export const typeormLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {

    const loadedConnectionOptions = await getConnectionOptions();

    const connectionOptions = Object.assign(loadedConnectionOptions, {
            type: env.db.type as any,
            host: env.db.host,
            port: env.db.port,
            username: env.db.username,
            password: env.db.password,
            database: env.db.database,
            synchronize: env.db.synchronize,
            logging: env.db.logging,
            entities: env.app.dirs.entities,
            migrations: env.app.dirs.migrations,
            ssl: {
                ca: process.env.SSL_CERT,
                rejectUnauthorized: false,
            },
            url: process.env.DATABASE_URL || env.db.url,
        });

    const connect2Database = async (): Promise<void> => {
        const connection = await createConnection(connectionOptions);
        settings.setData('connection', connection);
        settings.onShutdown(() => connection.close());
    };

    connect2Database().then(async () => {
        // nothing
    });

};
