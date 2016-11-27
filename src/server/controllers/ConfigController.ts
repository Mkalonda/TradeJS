import * as path    from 'path';
import * as fs      from 'fs';

const merge = require('deepmerge');

export default class ConfigController {

    private _configPath: string = path.join(__dirname, '../../../config/');
    private _configDefaultPath: string = path.join(this._configPath, 'tradejs.config.default.json');
    private _configCurrentPath: string = path.join(this._configPath, 'tradejs.config.json');

    constructor(protected opt, protected app) {}

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