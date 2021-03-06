import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';

import { User } from '../../api/models/User';

export class CreateaUsers implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        await connection
            .createQueryBuilder()
            .insert()
            .into(User)
            .values([
                {
                    id: 1,
                    name: 'admin',
                    email: 'admin@admin.com',
                    password: '$2b$12$OZSeyhLCdzEy9aBHSsrcrOXfpE8eACkB0CgnvHyaelLaMMdwOjS22',
                    role: 3,
                },
            ])
            .execute();
    }

}
