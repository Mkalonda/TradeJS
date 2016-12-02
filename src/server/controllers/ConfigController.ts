import * as path    from 'path';
import * as fs      from 'fs';
import * as mkdirp  from 'mkdirp';

const merge = require('deepmerge');

export default class ConfigController {

    private _configPath: string;
    private _configDefaultPath: string;
    private _configCurrentPath: string;

    constructor(protected opt, protected app) {
        console.log('opt', 'opt', 'opt', 'opt', opt);

        this._configPath = opt.path.config;
        this._configDefaultPath = '../../../config/tradejs.config.default.json';
        this._configCurrentPath = path.join(this._configPath, 'tradejs.config.json');

        // Ensure cache dir exists
        mkdirp.sync(this._configPath);
    }

    get() {
        return new Promise((resolve, reject) => {

            let defaultConfig = require(this._configDefaultPath),
                customConfig = {};

            try {
                delete require.cache[require.resolve(this._configCurrentPath)];
                customConfig = require(this._configCurrentPath);
            } catch (error) {
                console.warn('Config corrupted!');
            }

            resolve(merge.all([defaultConfig, customConfig, this.opt]));
        });
    }

    set(settings) {
        return new Promise(async (resolve, reject) => {

            let config = merge(await this.get(), settings);

            fs.writeFile(this._configCurrentPath, JSON.stringify(config, null, 2), (err, result) => {
                if (err)
                    return reject(err);

                resolve(config);
            });
        });
    }
}