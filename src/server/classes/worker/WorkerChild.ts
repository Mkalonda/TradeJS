declare var process:any;

require('source-map-support').install({
    handleUncaughtExceptions: true
});

import * as minimist    from 'minimist';
import Base             from '../Base';
import IPC              from '../ipc/IPC';

const debug = require('debug')('TradeJS:WorkerChild');

interface WorkerArguments {
    id: string;
    parentId: string;
}

interface WorkerOptions {
    id: string;
    parentId: string;
}

export default class WorkerChild extends Base {

    public id: string;

    protected _ipc: IPC;
    protected opt:any;

    constructor(opt, private workerOptions:WorkerOptions) {
        super(opt);

        /**
         *
         */
        this.id = workerOptions.id;

        /**
         *
         * @type {IPC}
         * @private
         */
        this._ipc = new IPC({id: this.workerOptions.id});
    }

    async init() {
        await super.init();

        await this._ipc.init();
        await this._ipc.connectTo(this.workerOptions.parentId);

    }

    static _initAsWorker() {

        if (typeof process != 'undefined') {

            let mainFile = null,
                settings = JSON.parse((<any>minimist(process.argv.slice(2))).settings);

            process.on('uncaughtException', err => {
                console.log('uncaughtException!', err);
                exitHandler();
            });

            process.on('unhandledRejection', err => {
                console.log('unhandledRejection!', err);
                exitHandler()
            });

            function exitHandler(code?:number) {
                debug(`Exiting [${mainFile ? mainFile.name : 'unknown'}]: ${code}`);
                process.exit(code);
            }

            process.on('exit', exitHandler);
            process.on('SIGINT', exitHandler);

            process.nextTick(async () => {
                mainFile = require(process.mainModule.filename).default;

                if (typeof mainFile != 'function')
                    return;

                debug(`Creating new [${mainFile.name}] instance with id [${settings.workerOptions.id}]`);

                const instance = new mainFile(settings.classArguments, settings.workerOptions);
                await instance.init();

                debug(`Created new [${mainFile.name}] instance with id [${settings.workerOptions.id}]`);

                process.send('__ready');

                process.stdin.resume();
            });
        }
    }
}

// In case its running as worker
WorkerChild._initAsWorker();


