import { Service } from 'typedi';
import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { User } from '../models/User';
import { events } from '../subscribers/events';
import bcrypt from 'bcrypt';
import { RoleService } from './RoleService';

@Service()
export class UserService {

    constructor(
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        @Logger(__filename) private log: LoggerInterface,
        private roleService: RoleService
    ) { }

    public async find(email: string) {
        this.log.info('Find all users by query');
        const list = await User.findOne(
            { where: {
                email: email,
            },
        });

        if (list) {
            return await this.userDetails(list);
        } else {
            throw new Error('User not found');
        }
    }

    public findOne(id: string): Promise<User | undefined> {
        this.log.info('Find one user');
        return User.findOne({ relations: ['policies'], where: { id } });
    }

    public async create(user: User) {

        if (await User.findOne({select: ['id'], where: {email: user.email}})) {
            throw new Error('User already exists!');
        } else {
            const BCRYPT_SALT_ROUNDS = 12;
            let newUser;
            await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS)
            .then(async (hashedPassword)  => {
                user.password = hashedPassword;
                user.role = Number(await this.roleService.getDefaultRole());
                newUser = await User.save(user);
                this.eventDispatcher.dispatch(events.user.created, newUser);
            })
            .catch((error) => {
                throw new Error(`Error saving user: ${error}`);
            });

            return await this.userDetails(newUser);
        }
    }

    public update(id: string, user: User): Promise<User> {
        this.log.info('Update a user');
        return User.save(user);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a user');
        await User.delete(id);
        return;
    }

    public async userDetails(user: User | User[]) {
        if (user instanceof User) {
            delete user['password'];
            user['userRole'] = await this.roleService.getRoleById(user.role);
        } else {
            await Object.keys(user).forEach(async element => {
                delete element['password'];
                element['userRole'] = await this.roleService.getRoleById(element['role']);
            });
        }

        return user;
    }

}
