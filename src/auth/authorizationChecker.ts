import { Action } from 'routing-controllers';
import { Container } from 'typedi';
import { Connection } from 'typeorm';

import { Logger } from '../lib/logger';
import { AuthService } from './AuthService';
import { RoleService } from '../api/services/RoleService';

export function authorizationChecker(connection: Connection): (action: Action, roles: string) => Promise<boolean> | boolean {
    const log = new Logger(__filename);
    const authService = Container.get<AuthService>(AuthService);
    // tslint:disable-next-line: prefer-const
    const roleService = Container.get<RoleService>(RoleService);

    return async function innerAuthorizationChecker(action: Action, authorizedRole: string): Promise<boolean> {
        const credentials = authService.getIdBearerFromRequest(action.request);

        if (credentials === undefined) {
            log.warn('No credentials given');
            return false;
        }

        action.request.user = await authService.validateUser(credentials);
        if (action.request.user === undefined) {
            log.warn('Invalid credentials given');
            return false;
        }

        if (action.request.user.role >= await roleService.getRoleByName(authorizedRole)) {
            log.info('Successfully checked credentials');
            return true;
        } else {
            log.error('Invalid Permissions');
            return false;
        }

    };
}
