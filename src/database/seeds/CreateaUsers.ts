import {Factory, Seed, times} from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';

import { User } from '@models/User';

export class CreateaUsers implements Seed {

    public async seed(factory: Factory, connection: Connection): Promise<any> {
        const em = connection.createEntityManager();
        const users = [{
            id: 1,
            name: 'admin',
            email: 'admin@admin.com',
            password: '$2b$12$OZSeyhLCdzEy9aBHSsrcrOXfpE8eACkB0CgnvHyaelLaMMdwOjS22',
            role: 3,
        }];
        await times(users.length, async (n) => {
            const user: User = new User();

            user.id = users[n].id;
            user.name = users[n].name;
            user.email = users[n].email;
            user.password = users[n].password;
            user.role = users[n].role;

            return await em.save(user);
        });
    }

}
