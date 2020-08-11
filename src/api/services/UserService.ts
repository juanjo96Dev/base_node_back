import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { events } from '../subscribers/events';
import bcrypt from 'bcrypt';

@Service()
export class UserService {

    constructor(
        @OrmRepository() private userRepository: UserRepository,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        @Logger(__filename) private log: LoggerInterface
    ) { }
    public async find(email: string): Promise<User> {
        this.log.info('Find all users by query');
        const list = await User.findOne(
            { where: {
                email: email,
            },
        });

        if (list) {
            return list;
        } else {
            throw new Error('User not found');
        }
    }

    public findOne(id: string): Promise<User | undefined> {
        this.log.info('Find one user');
        return this.userRepository.findOne({ relations: ['policies'], where: { id } });
    }

    public async create(user: User): Promise<User> {

        if (await User.findOne({where: {email: user.email}})) {
            throw new Error('User already exists!');
        } else {
            const BCRYPT_SALT_ROUNDS = 12;
            let newUser;
            await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS)
            .then(async (hashedPassword)  => {
                user.password = hashedPassword;
                newUser = await this.userRepository.save(user);
                this.eventDispatcher.dispatch(events.user.created, newUser);
            })
            .catch((error) => {
                throw new Error(`Error saving user: ${error}`);
            });

            return newUser;
        }
    }

    public update(id: string, user: User): Promise<User> {
        this.log.info('Update a user');
        return this.userRepository.save(user);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a user');
        await this.userRepository.delete(id);
        return;
    }

}
