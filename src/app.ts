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

import { iocLoader } from '@loaders/iocLoader';
import { winstonLoader } from '@loaders/winstonLoader';
import { expressLoader } from '@loaders/expressLoader';
import { banner } from '@lib/banner';
import { Logger } from '@lib/logger';

const log = new Logger(__filename);

winstonLoader();
iocLoader();

expressLoader().then(() => banner(log))
.catch(error => log.error(error));
