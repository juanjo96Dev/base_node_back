import {Factory, Seed, times} from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';

import { Role } from '@models/Roles';

export class CreateRoles implements Seed {

    public async seed(factory: Factory, connection: Connection): Promise<any> {
        const em = connection.createEntityManager();
        const roles = [{
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
        }];
        await times(roles.length, async (n) => {
            const role = new Role();

            role.id = roles[n].id;
            role.name = roles[n].name;
            role.defaultRole = roles[n].defaultRole;

            return await em.save(role);
        });
    }

}
