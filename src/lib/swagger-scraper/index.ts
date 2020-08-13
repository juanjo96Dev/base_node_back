import { env } from '@src/env';
import glob from 'glob';
import fs from 'fs';
import { Logger } from '@lib/logger';
import * as paths from 'path';

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
            name: /(\w+)Controller/.exec(file)[1],
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
     * 1 - method, $2 params
     * 2 - tag
     * 3 - Security
     */
    const patterns = [
        "@JsonController\\('([^']+)'\\)",
        '(?:\\/\\*\\*(?:[\\t\\*\\s]+(?<=\\s+\\*[^\\/])[^\\n]+)*\\n\\s+\\*\\/)?(?:@\\w+\\([^)]*\\)[\\n\\s]+)*@(all|checkout|connect|copy|delete|get|head|lock|merge|mkactivity|mkcol|move|m-search|notify|options|patch|post|propfind|proppatch|purge|put|report|search|subscribe|trace|unlock|unsubscribe)\\(\'?([\\w:\\/]*)\'?\\)\\n?\\s*[\\w@]*\\(?(\\w+)?\\)?\\n\\s+[^\\n]+[^@]+',
        "from ['][^m]+models\\/([^']+)",
        '@authorized([^)]+)[^{]+class[^{]+',
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
// Transform types to conventional types in swagger
const conventionalTypes = (type: string) => {
    const result = {};
    switch (type.toLowerCase()) {
        case 'date':
            result['type'] = 'string';
            result['format'] = 'date-time';
        break;
        default:
            result['type'] = type;
    }

    return result;
};

// Get schema for body
const getBodySchema = (cadena: string) => {
    /**
     * 0 - Property name
     * 1 - Type of property
     */
    const pattern = /(?:@Is\w+\('?\w*'?\)[\n\s]+)+[^)]+\)\n\s+public\s([\w_]+):\s(\w+)/gmi;

    const requires = [];

    let index = 0;

    const columns = getSubGroups(cadena, pattern);

    // Detect requires properties
    let group;
    while ((group = pattern.exec(cadena)) !== null) {
        if (group[0].toLowerCase().indexOf('isoptional') === -1) {
            requires.push(columns[index][0]);
        }
        index++;
    }

    const result = {
        required: requires,
        properties: {},
    };

    columns.map(elm => {
        result.properties[elm[0]] = conventionalTypes(elm[1]);
    });

    return result;
};

// Get schema for required elements to execute route element
const getElmJSON = (cadena: string, full: string) => {
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

                        const path = new RegExp(`import\\s*\\{\\s*${params[3]}\\s*\\}\\s*from\\s*'([^']+)'`, 'gmi').exec(full)[1].split('/');

                        let fullPath: string;

                        switch (path[0]) {
                            case '@validators':
                                fullPath = 'src/api/validators';
                                break;
                            default:
                                fullPath = 'src/api/models';
                        }

                        const body = glob(paths.resolve(`${fullPath}/${path[1]}.ts`), {
                            sync: true,
                            }).map((f) => fs.readFileSync(f, 'utf8'))[0];

                        result['requestBody'] = {
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                            ...getBodySchema(body),
                                    },
                                },
                            },
                            required: true,
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
        const path = getMatches(file, 0)['length'] > 0 ? getMatches(file, 0)['matches'][0] : '';

        if (path !== '') {
            swaggerPaths[path] = {};

            const routes = getMatches(file, 1);

            const tag = files[num]['name'];

            const security = getMatches(file, 3)['matches'].length > 0 ? [{bearerAuth: []}] : [];

            tags.push({ name: tag});

            let index = 0;

            for (const element of routes['matches']) {
                const full = routes['full'][index++];

                const method = element[0].toLowerCase();

                if (full.indexOf('Authorized') > 0 && security.length === 0) {
                    security.push({bearerAuth: []});
                }

                const contenido = {
                    tags: [tag],
                    security: security,
                    responses: {},
                    ...getComments(full, ['summary', 'description']),
                    ...getElmJSON(full, file),
                };

                if (element[1] !== '') {
                    // Ruta distinta
                    const newPath = element[1].replace(/:(\w+)/, '{$1}');
                    if (!swaggerPaths[path + newPath]) {
                        swaggerPaths[path + newPath] = {};
                    }
                    swaggerPaths[path + newPath][method] = contenido;
                } else {
                    swaggerPaths[path][method] = contenido;
                }
            }
        } else {
            log.error(`There is an error with the controller file in '${dir}'`);
        }
    });

    return { paths: swaggerPaths, tag: tags };
};
