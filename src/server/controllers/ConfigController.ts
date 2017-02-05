import * as path    from 'path';
import * as fs      from 'fs';
import * as mkdirp  from 'mkdirp';

const merge = require('deepmerge');

interface IAppConfig {
    system?: {
        port?: number
        timezone?: string,
    },
    path?: {
        cache?: string,
        custom?: string,
        config?: string
    },
    account?: any
}

export default class ConfigController {

    private _config: IAppConfig = {};

    private _configCurrentPath: string = path.join(this.opt.path.config, 'tradejs.config.json');
    private _configDefaultPath: string = '../../../config/tradejs.config.default.js';

    constructor(protected opt: IAppConfig, protected app) {}

    async init(): Promise<IAppConfig> {
        return this.set(await this._load());
    }

    get(): IAppConfig {
        return this._config;
    }

    set(settings: IAppConfig): Promise<IAppConfig> {
        return new Promise(async (resolve, reject) => {

            // Write to variable
            this._config = merge(this._config, settings);

            // Write to file
            fs.writeFile(this._configCurrentPath, JSON.stringify(this._config, null, 2), err => {
                if (err)
                    return reject(err);

                resolve(this._config);
            });
        });
    }

    _load(): Promise<IAppConfig> {
        return new Promise((resolve, reject) => {

            let defaultConfig = require(this._configDefaultPath),
                customConfig = {}, config;

            try {
                delete require.cache[require.resolve(this._configCurrentPath)];
                customConfig = require(this._configCurrentPath);
            } catch (error) {
                console.warn('Config corrupted!');
            }

            config = merge.all([defaultConfig, customConfig, this.opt]);

            resolve(config);
        });
    }
}