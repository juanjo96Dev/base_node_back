import {Body, Post, JsonController, Res} from 'routing-controllers';

import { Login } from '@validators/login.validator';
import { AuthService } from '@auth/AuthService';
import { User } from '@models/User';
import { UserService } from '@services/UserService';
import HttpStatus from '../../shared/utils/http-status';

@JsonController('/auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private userService: UserService
    ) { }

    @Post('/login')
    public async login(@Body() login: Login, @Res() res) {
        const logged = await this.authService.login(login);

        if (logged) {
            return res.status(HttpStatus.OK).send(logged);
        } else {
            return res.status(HttpStatus.UNAUTHORIZED).send('Incorrect credentials!');
        }
    }

    @Post()
    public register(@Body() user: User) {
        return this.userService.create(user);
    }
}
