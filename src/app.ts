import 'module-alias/register';
import moduleAlias from 'module-alias';

moduleAlias.addAliases({
    '@loaders'		    : __dirname + '/loaders',
    '@controllers'		: __dirname + '/api/controllers',
    '@errors'	        : __dirname + '/api/errors',
    '@models'		    : __dirname + '/api/models',
    '@middlewares'    	: __dirname + '/api/middlewares',
    '@repositories'		: __dirname + '/api/repositories',
    '@api'		        : __dirname + '/api',
    '@services'        	: __dirname + '/api/services',
    '@lib'            	: __dirname + '/lib',
    '@shared'           : __dirname + '/shared',
    '@subscribers'		: __dirname + '/api/subscribers',
    '@validators'	    : __dirname + '/api/validators',
    '@seeds'		    : __dirname + '/database/seeds',
    '@migrations'       : __dirname + '/database/migrations',
    '@auth'             : __dirname + '/auth',
    '@src'		        : __dirname,
});

import 'reflect-metadata';

import { bootstrapMicroframework } from 'microframework-w3tec';

import { banner } from './lib/banner';
import { Logger } from './lib/logger';
import { expressLoader } from '@loaders/expressLoader';
import { homeLoader } from './loaders/homeLoader';
import { iocLoader } from './loaders/iocLoader';
import { swaggerLoader } from './loaders/swaggerLoader';
import { typeormLoader } from './loaders/typeormLoader';
import { winstonLoader } from './loaders/winstonLoader';

const log = new Logger(__filename);

bootstrapMicroframework({
    /**
     * APP MODULES
     */
    loaders: [
        winstonLoader,
        iocLoader,
        typeormLoader,
        expressLoader,
        swaggerLoader,
        homeLoader,
    ],
})
    .then(() => banner())
    .catch(error => log.error(error));
