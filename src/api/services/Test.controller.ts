import { IRequest } from '@shared/models/request.model';
import { Response } from 'express';

export class TestController {
    public async find(req: IRequest, res: Response) {
        const reqq = req;
        reqq.user = 1;

        res.status(200).send({message: 'success'});
    }

    public async one(req: IRequest, res: Response) {
        const reqq = req;
        reqq.user = 1;
        console.log(reqq.user);

        res.status(200).send({message: 'swag'});
    }
}

export const testCtrl = new TestController();
