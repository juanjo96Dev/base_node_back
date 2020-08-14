import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createConnection, getConnectionOptions } from 'typeorm';

import { env } from '@src/env';

export const typeormLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {
    console.log('swagger init');

    const loadedConnectionOptions = await getConnectionOptions();

    console.log('loadedConnectionOptions loaded');

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
    });

    console.log('connectionOptions created');

    const connection = await createConnection(connectionOptions);

    console.log('connection created');

    if (settings) {
        settings.setData('connection', connection);
        settings.onShutdown(() => connection.close());
        console.log('typeorm connection created');
    }
};
