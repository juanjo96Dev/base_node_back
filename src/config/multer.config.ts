import fs from 'fs-extra';
import multer from 'multer';

const root = 'files/';

const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        fs.mkdirsSync(root);
        cb(null, root);
    },
    filename: async (req: any, file: any, cb: any) => {
        let path = `${root}${file.originalname}`;

        let documentCount = 0;
        const fileType = file.originalname.split('.').pop();
        const fileName = file.originalname.split(`.${fileType}`)[0];

        while (fs.existsSync(path)) {
            documentCount++;
            file.originalname = `${fileName} (${documentCount}).${fileType}`;
            path = `${root}${file.originalname}`;
        }

        cb(null, file.originalname);
    },
});

export const uploadFile = (extensionsAccepted: string | string[]) => {
    return multer({
        limits: { fieldSize: 25 * 1024 * 1024 },
        storage: storage,
        fileFilter: (req: any, file: any, cb: any) => {

            if (typeof extensionsAccepted === 'string') {
                extensionsAccepted = [extensionsAccepted];
            }

            if (extensionsAccepted.some(ext => file.originalname.toLowerCase().endsWith('.' + ext))) {
                return cb(null, true);
            }

            const error = new Error();
            error.name = 'EXTENSION_NOT_VALID';
            error.message = req.i18n.t('app:errors.no_extension_accepted');
            return cb(error);
        },
    });
};
