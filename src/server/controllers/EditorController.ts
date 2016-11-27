import * as fs      from 'fs';
import * as path    from 'path';
import * as _debug  from 'debug';

const dirTree   = require('directory-tree');
const debug     = _debug('TradeJS:EditorController');

export default class EditorController {

    private pathCustom = path.join(__dirname, '../../../custom/');

    constructor(protected opt, protected app) {}

    async init() {}

    load(filePath) {
        return new Promise((resolve, reject) => {
            debug(`Loading ${filePath}`);

            filePath = this._getFullPath(filePath);

            fs.readFile(filePath, (err, data) => {
                if (err) return reject(err);

                resolve(data.toString());
            });
        });
    }

    save(filePath, content) {
        return new Promise((resolve, reject) => {
            debug(`Saving ${filePath}`);

            filePath = this._getFullPath(filePath);

            fs.writeFile(filePath, content, err => {
                if (err) return reject(err);

                resolve();
            });
        });
    }

    getDirectoryTree() {
        return dirTree(this.pathCustom)
    }

    private _getFullPath(filePath) {
        return path.join(this.pathCustom, '../', filePath);
    }
}
