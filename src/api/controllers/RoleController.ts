import {JsonController, Get, Res, Authorized} from 'routing-controllers';

import { RoleService } from '@services/RoleService';
import HttpStatus from '../../shared/utils/http-status';

@Authorized(['user'])
@JsonController('/roles')
export class AuthController {
    constructor(
        private roleService: RoleService
    ) { }

    @Get('/list')
    public async list(@Res() res) {
        const logged = await this.roleService.list();

        if (logged) {
            return res.status(HttpStatus.OK).send(logged);
        } else {
            return res.status(HttpStatus.UNAUTHORIZED).send('');
        }
    }
}
