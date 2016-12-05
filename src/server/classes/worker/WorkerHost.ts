declare var clearInterval:any;

import {spawn, fork}    from 'child_process';
import * as _           from 'lodash';
import * as _debug      from 'debug';
import Base             from '../Base';

const merge = require('deepmerge');
const debug = _debug('TradeJS:WorkerHost');

export default class WorkerHost extends Base {

    public id: string|number;
    public _ipc: any;
    private _child: any = null;

    /**
     *
     * @param opt {Object}
     */
    constructor(protected opt) {
        super(opt);
        this.id = this.opt.id;
        this._ipc = this.opt.ipc;
    }

    /**
     *
     * @private
     */
    async init() {
        await super.init();

        await this._fork();
    }



    send(...params) {
        return this._ipc.send(this.id, ...params);
    }

    async _fork() {

        // Merge given options
        let childArgv = JSON.stringify({
                classArguments: this.opt.classArguments || {},
                workerOptions: {
                    id: this.id,
                    parentId: this._ipc.id
                }
            }),

            childOpt = {
                stdio: ['pipe', process.stdout, process.stderr, 'ipc'],
                //shell: true,
                cwd: __dirname,
                env: process.env
            };

        this._child = spawn('node', ['--harmony-async-await', this.opt.path, ...process.execArgv, `--settings=${childArgv}`], childOpt);

        this._child.on('close', code => {
            debug(`${this.id} exited with code ${code}`);
            this.emit('close', code);
        });

        await new Promise((resolve, reject) => {

            this._child.once('message', message => {
                if (message === '__ready')
                    return resolve();
                else {
                    reject(message);
                }
            });
        });
    }

    _getSocket() {
        return new Promise((resolve, reject) => {
            let now = Date.now(),
                timeout = now + 2000,
                interval = 100;

            let t = setInterval(() => {
                let socket = this._ipc._getSocket(this.id);

                if (socket) {
                    clearInterval(t);
                    return resolve(socket);
                }

                if (Date.now() > timeout) {
                    clearInterval(t);
                    reject('IPC Socket to master did not respond in time');
                }

            }, interval);
        });
    }

    kill() {
        this._child.kill();
    }
}
