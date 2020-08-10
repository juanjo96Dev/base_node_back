import * as express from 'express';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { User } from '../api/models/User';
import { UserRepository } from '../api/repositories/UserRepository';
import { Logger, LoggerInterface } from '../decorators/Logger';
import { Login } from '@validators/login.validator';
import bcrypt from 'bcrypt';

@Service()
export class AuthService {

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private userRepository: UserRepository
    ) { }

    public parseBasicAuthFromRequest(req: express.Request): { name: string, password: string } {
        const authorization = req.header('authorization');

        if (authorization && authorization.split(' ')[0] === 'Basic') {
            this.log.info('Credentials provided by the client');
            const decodedBase64 = Buffer.from(authorization.split(' ')[1], 'base64').toString('ascii');
            console.log(decodedBase64, authorization);
            const name = decodedBase64.split(':')[0];
            const password = decodedBase64.split(':')[1];
            if (name && password) {
                return { name, password };
            }
        }

        this.log.info('No credentials provided by the client');
        return undefined;
    }

    public async login(login: Login) {
        let samePassword = false;
        await User.findOne(
            { where: {
                email: login.email,
            },
        }).then(async (user) => {
            samePassword =  await bcrypt.compare(login.password, user.password);
        })
        .catch((error) => {
            throw new Error(`Error authenticating user: ${error}`);
        });

        return samePassword;
    }

    public async validateUser(name: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                name,
            },
        });

        if (user) {
            if (await User.comparePassword(user, password)) {
                return user;
            }
        }

        return undefined;
    }

}
