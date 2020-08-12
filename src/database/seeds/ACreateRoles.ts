import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';

import { Role } from '../../api/models/Roles';

export class CreateRoles implements Seeder {
    public async run(factory: Factory, connection: Connection): Promise<any> {
        await connection
            .createQueryBuilder()
            .insert()
            .into(Role)
            .values([
                {
                    id: 1,
                    name: 'user',
                    defaultRole: 1,
                },
                {
                    id: 2,
                    name: 'admin',
                    defaultRole: 0,
                },
                {
                    id: 3,
                    name: 'superadmin',
                    defaultRole: 0,
                },
            ])
            .execute();
    }
}
