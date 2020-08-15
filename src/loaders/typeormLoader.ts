import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createConnection, getConnectionOptions, ConnectionOptions } from 'typeorm';

import { env } from '@src/env';

export const typeormLoader: MicroframeworkLoader = async (settings: MicroframeworkSettings | undefined) => {

    const getOptions = async () => {
        let connectionOptions: ConnectionOptions;
        connectionOptions = {
          type: 'postgres',
          synchronize: false,
          logging: false,
          extra: {
            ssl: true,
          },
          entities: env.app.dirs.entities,
          migrations: env.app.dirs.migrations,
        };
        if (process.env.DATABASE_URL) {
          Object.assign(connectionOptions, { url: process.env.DATABASE_URL });
        } else {
          // gets your default configuration
          // you could get a specific config by name getConnectionOptions('production')
          // or getConnectionOptions(process.env.NODE_ENV)
          connectionOptions = await getConnectionOptions();
        }

        return connectionOptions;
    };

    const connect2Database = async (): Promise<void> => {
        const typeormconfig = await getOptions();
        await createConnection(typeormconfig);
    };

    connect2Database().then(async () => {
        console.log('Connected to database');
    });
};
