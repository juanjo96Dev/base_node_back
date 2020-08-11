import { Service } from 'typedi';
import { Role } from '@models/Roles';

@Service()
export class RoleService {

    public async list() {
        const list = await Role.findOne();
        return this.handler(list, 'Role not found!');
    }

    public async getRoleById(id: number) {
        const role = await Role.findOne({select: ['name'], where: {id: id}});
        return this.handler(role.name, 'Role not found!');
    }

    public async getDefaultRole() {
        const def = await Role.findOne({where: { defaultRole: 1}});
        return this.handler(def.id, 'Default role not found!');
    }

    private handler(object: any, error: string)  {
        if (object) {
            return object;
        } else {
            throw new Error(error);
        }
    }

}
