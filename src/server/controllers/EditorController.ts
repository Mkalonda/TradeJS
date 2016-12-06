import * as fs      from 'fs';
import * as path    from 'path';
import * as _debug  from 'debug';
import * as os      from 'os';
import {spawn}      from 'child_process';

const dirTree = require('directory-tree');
const debug = _debug('TradeJS:EditorController');

export default class EditorController {

    private pathCustom = path.join(__dirname, '../../../custom/');

    constructor(protected opt, protected app) {
    }

    public async init() {}

    public load(filePath) {
        return new Promise((resolve, reject) => {
            debug(`Loading ${filePath}`);

            filePath = this._getFullPath(filePath);

            fs.readFile(filePath, (err, data) => {
                if (err) return reject(err);

                resolve(data.toString());
            });
        });
    }

    public async save(filePath, content) {
        await this._writeToFile(filePath, content);

        let inputPath = this._getCustomAbsoluteRootFolder(filePath),
            outputPath = this._getBuildAbsoluteRootFolder(filePath);

        return this._compile(inputPath, outputPath);
    }

    public getDirectoryTree() {
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

    private _compile(inputPath, outputPath) {

        return new Promise((resolve, reject) => {

            let childOpt = {
                    stdio: ['pipe', process.stdout, process.stderr, 'ipc'],
                    //shell: true,
                    cwd: __dirname,
                    env: process.env
                },
                child = spawn('gulp', ['custom:build', `--input-path=${inputPath}`, `--output-path=${outputPath}`], childOpt);

            child.on('close', resolve);
        });
    }


    // TODO: Bit of a hacky way to get root folder
    private _getFileRelativeRootFolder(filePath: string): string {
        console.log('filePath.split().splice(1, 3).join();', filePath.split('/').splice(1, 2).join('/'));
        return filePath.split('/').splice(1, 2).join('/');
    }

    private _getCustomAbsoluteRootFolder(filePath: string): string {
        return path.join(this.app.controllers.config.get().path.custom, this._getFileRelativeRootFolder(filePath));
    }

    private _getBuildAbsoluteRootFolder(filePath: string): string {
        return path.join(this.app.controllers.config.get().path.custom, '..', '_builds', this._getFileRelativeRootFolder(filePath));
    }
}
