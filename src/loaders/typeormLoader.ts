import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createConnection, getConnectionOptions, ConnectionOptions } from 'typeorm';

import { env } from '@src/env';

export const typeormLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {

    const connectionOptions = async () => {
        // tslint:disable-next-line: no-shadowed-variable
        let connectionOptions: ConnectionOptions;
        connectionOptions = {
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
        };

        if (process.env.DATABASE_URL || env.db.url) {
            Object.assign(connectionOptions, { url: process.env.DATABASE_URL || env.db.url });
        } else {
            // gets your default configuration
            // you could get a specific config by name getConnectionOptions('production')
            // or getConnectionOptions(process.env.NODE_ENV)
            connectionOptions = await getConnectionOptions();
         }

        return connectionOptions;
    };

    console.log('work');
    let connection;
    try {
        connection = await createConnection(await connectionOptions());
        console.log('still working');
    } catch (error) {
        console.log(error);
    }

    settings.setData('connection', connection);
    settings.onShutdown(() => connection.close());
    console.log('typeorm connection created');
};
