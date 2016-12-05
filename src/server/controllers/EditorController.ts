import * as fs      from 'fs';
import * as path    from 'path';
import * as _debug  from 'debug';
import * as os      from 'os';
import {spawn}      from 'child_process';

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

    async save(filePath, content) {
       await this._writeToFile(filePath, content);


       return this._compile();
    }

    getDirectoryTree() {
        return dirTree(this.pathCustom)
    }

    private _getFullPath(filePath) {
        return path.join(this.pathCustom, '../', filePath);
    }

    private _writeToFile(filePath: string, content: string) {

        return new Promise((resolve, reject) => {
            filePath = this._getFullPath(filePath);

            fs.writeFile(filePath, content, err => {
                if (err) return reject(err);

                resolve();
            });
        })
    }

    private _compile() {

        return new Promise((resolve, reject) => {
            console.log('COMPILEDSDFSFSd');
            let inputPath = this.app.controllers.config.get().path.custom,
                outputPath = path.join(inputPath, '../', 'dist', 'shared'),
                childOpt = {
                    stdio: ['pipe', process.stdout, process.stderr, 'ipc'],
                    //shell: true,
                    cwd: __dirname,
                    env: process.env
                };

            const child = spawn('gulp', ['custom:build', `--input-path=${inputPath}`, `--output-path=${outputPath}`], childOpt);

            child.on('close', code => {
                console.log('COMPILEDSDFSFSd', code);
               resolve();
            });
        });

    }
}
