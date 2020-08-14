import { env } from '@src/env';
import { Logger } from '@lib/logger/index';

export function banner(log: Logger): void {

    if (env.app.banner) {
        const route = () => `${env.app.schema}://${env.app.host}:${env.app.port}`;
        log.info(``);
        log.info(`The app is ready on ${route()}${env.app.routePrefix}`);
        log.info(`To shut it down, press <CTRL> + C at any time.`);
        log.info(``);
        log.info('-------------------------------------------------------');
        log.info(`Environment  : ${env.node}`);
        log.info(`Version      : ${env.app.version}`);
        log.info(``);
        log.info(`API Info     : ${route()}${env.app.routePrefix}`);
        if (env.swagger.enabled) {
            log.info(`Swagger      : ${route()}${env.swagger.route}`);
        }
        if ( env.metrics.enabled) {
            log.info(`Metrics      : ${route()}/metrics`);
        }
        log.info('-------------------------------------------------------');
        log.info('');
    } else {
        log.info(`Application is up and running.`);
    }
}
