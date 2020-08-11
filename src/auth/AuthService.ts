import * as express from 'express';
import { Service } from 'typedi';

import { User } from '../api/models/User';
import { Logger, LoggerInterface } from '../decorators/Logger';
import { Login } from '@validators/login.validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '@src/env';
import { expirationTime } from '../shared/helpers/date-helper';

@Service()
export class AuthService {

    constructor(
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public getIdBearerFromRequest(req: express.Request): number {
        const authorization = req.header('authorization');

        if (authorization && authorization.split(' ')[0] === 'Bearer') {
            this.log.info('Credentials provided by the client');
            const verified = jwt.verify(authorization.split(' ')[1], env.app.secretKey);
            return verified.id;
        }

        this.log.info('No credentials provided by the client');
        return undefined;
    }

    public async login(login: Login) {
        let logged: boolean | object = false;
        await User.findOne(
            { where: {
                email: login.email,
            },
        }).then(async (user) => {
            const samePassword =  await bcrypt.compare(login.password, user.password);
            if (samePassword) {
                delete user.password;
                logged = {
                    token: this.generateToken(user),
                    user: user,
                };
            }
        })
        .catch((error) => {
            throw new Error(`Error authenticating user: ${error}`);
        });

        return logged;
    }

    public async validateUser(id: number): Promise<User | undefined> {
        return await User.findOne({where: {
            id: id,
        }}).then((user) => user).catch(() => {
            return undefined;
        });
    }

    private generateToken(user: User, expiration: {amount: number, type: 'h' | 'd' | 'w' | 'y'} = {amount: 1, type: 'y'}) {

        return jwt.sign({exp: expirationTime(expiration.amount, expiration.type), id: user.id}, env.app.secretKey);
    }

}
