import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createConnection, getConnectionOptions } from 'typeorm';

import { env } from '@src/env';

export const typeormLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {

    const loadedConnectionOptions = await getConnectionOptions();

    const connectionOptions = Object.assign(loadedConnectionOptions, {
        url: env.db.url,
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
            rejectUnauthorized: false,
        },
    });

    console.log('work');

    const connection = await createConnection(connectionOptions);

    console.log('still working');

    settings.setData('connection', connection);
    settings.onShutdown(() => connection.close());
    console.log('typeorm connection created');
};
