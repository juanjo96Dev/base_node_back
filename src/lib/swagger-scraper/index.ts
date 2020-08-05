import { env } from '@src/env';
import glob from 'glob';
import fs from 'fs-extra';
import { Logger } from '@lib/logger';

const log = new Logger(__dirname);

// Get file controllers founded in path api/controllers
const getControllers = async (): Promise<object> => {
    const pattern = env.app.dirs.controllers;
    const controllersFiles: string[] = glob(pattern[0], {
        sync: true,
    }).map((file) => {
        return {
            content: fs.readFileSync(file, 'utf8'),
            path: file,
        };
    });

    return controllersFiles;
};

// Get subGroups of pattern
const getSubGroups = (cadena, exp): string[] => {
    let group;
    const matchs: any[] = [];
    while ((group = exp.exec(cadena)) !== null) {
        const subGroups: any[] = [];
        for (let x = 1; x < group.length; x++) {
            subGroups.push(group[x]);
        }
        matchs.push(subGroups);
    }

    return matchs;
};

// Get the comments of route element
const getComments = (cadena, array): object => {
    const result = {};
    array.forEach((element) => {
        const found = new RegExp(`${element}:\\s+([^\\n]+)`).exec(cadena);
        if (found) {
            result[element] = found[1];
        }
    });
    return result;
};

// Get each routes element, for example when do get
const getMatches = (cadena: string, element: number): object => {
    /**
     * 0 - path
     * 1 - method, $3 params, $7 function
     * 2 - tag
     */
    const patterns = [
        "@JsonController\\('([^']+)'\\)",
        "(?:\\/\\*\\*([^\\t]+)\\*\\/)?\\n\\s+@(all|checkout|connect|copy|delete|get|head|lock|merge|mkactivity|mkcol|move|m-search|notify|options|patch|post|propfind|proppatch|purge|put|report|search|subscribe|trace|unlock|unsubscribe)\\(\\'?([\\w:\\/]*)\\'?\\)\\n?\\s*[\\w@]*\\(?(\\w+)?\\)?\\n\\s+[^\\n]+\\n\\s+return ([\\w.]+)",
        "from ['][^m]+models\\/([^']+)",
    ];

    const exp = new RegExp(patterns[element], 'gmi');
    const matchs = getSubGroups(cadena, exp);

    const count = matchs ? matchs.length : 0;

    return { matches: matchs, length: count, full: cadena.match(exp) };
};
// Get a element of array that key is equal to name
const getNameElm = (name: string, array: any[]) => {
    const found = array[array.findIndex((sub) => sub.indexOf(name) !== -1)];
    return found ? found[1] : undefined;
};

// Get schema for required elements to execute route element
export const getElmJSON = (cadena: string) => {
    const result = {};

    /**
     * 0 - Type of params
     * 1 - Variable
     * 2 - Options of variable
     * 3 - Type of variable
     */
    const pattern = /@(queryparam|param|body)\('?(\w+)?'?,?\s*\{?([\w:\s,]+)?\}?\)\s\w+:\s+(\w+)/gim;

    const subGroups = getSubGroups(cadena, pattern);

    if (subGroups) {
        subGroups.forEach(params => {
            // Classification
            switch (params[0].toLowerCase()) {
                case 'queryparam':
                case 'param':
                    if (!result['parameters']) {
                        result['parameters'] = [];
                    }
                    const ob: object = {};

                    const options = getSubGroups(params[2], /(\w+):\s+(\w+)/gmi);

                    const required = getNameElm('required', options);

                    ob['name'] = params[1];
                    ob['in'] = params[0].toLowerCase() === 'param' ? 'path' : 'query';
                    ob['required'] = required !== undefined ? JSON.parse(required) : true;
                    ob['schema'] = { type: params[3]};

                    // Push object schema
                    result['parameters'].push(ob);
                    break;
                default:
                    if (!result['requestBody']) {
                        result['requestBody'] = {
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                        },
                                    },
                                },
                            },
                        };
                    }
            }
        });
    }

    return Object.keys(result).length > 0 ? result : undefined;
};

// Main function
export const swaggerScraper = async () => {
    const files: object = await getControllers();

    const swaggerPaths: object = {};

    const tags: object[] = [];

    Object.keys(files).forEach((num) => {
        const file = files[num]['content'];
        const dir = files[num]['path'];
        const path =
            getMatches(file, 0)['length'] > 0
                ? getMatches(file, 0)['matches'][0]
                : '';

        if (path !== '') {
            swaggerPaths[path] = {};

            const routes = getMatches(file, 1);

            const tag = getMatches(file, 2)['matches'][0];

            tags.push({ name: tag[0] });

            let index = 0;
            routes['matches'].forEach((element) => {
                const elms = getElmJSON(routes['full'][index++]);

                const method = element[1].toLowerCase();

                const contenido = {
                    tags: tag,
                    responses: {},
                };

                Object.assign(
                    contenido,
                    getComments(element[0], ['summary', 'description']),
                    elms
                );

                if (element[2] !== '') {
                    // Ruta distinta
                    const newPath = element[2].replace(/:(\w+)/, '{$1}');
                    if (!swaggerPaths[path + newPath]) {
                        swaggerPaths[path + newPath] = {};
                    }
                    swaggerPaths[path + newPath][method] = contenido;
                } else {
                    swaggerPaths[path][method] = contenido;
                }
            });
        } else {
            log.error(`There is an error with the controller file in '${dir}'`);
        }
    });

    return { paths: swaggerPaths, tag: tags };
};
