import * as path from 'path';
import WorkerHost from '../classes/worker/WorkerHost';

export default class CacheController {

    private _worker: WorkerHost = null;

    constructor(protected opt, protected app) {}

    public init() {
        this._worker = new WorkerHost({
            id: 'cache',
            ipc: this.app._ipc,
            path: path.join(__dirname, '../cache/Cache.js'),
            classArguments: {
                settings: this.app.controllers.config.get()
            }
        });

        this._worker._ipc.on('tick', tick => {
            this.app._io.sockets.emit('tick', tick);
        });

        return this._worker.init();
    }

    public read(instrument, timeFrame, from, until, bufferOnly) {

        return this
            ._worker
            .send('read', {
                instrument: instrument,
                timeFrame: timeFrame,
                from: from,
                until: until,
                bufferOnly: bufferOnly
            });
    }

    public fetch(instrument, timeFrame, from, until) {
        return this
            ._worker
            .send('fetch', {
                instrument: instrument,
                timeFrame: timeFrame,
                from: from,
                until: until
            });
    }

    public reset() {
        return this
            ._worker
            .send('@reset');
    }

    public getInstrumentList() {
        return this._worker.send('instruments-list');
    }

    public async updateSettings(settings) {
        this._worker.send('broker:settings', settings);
    }

    public async destroy() {
        if (this._worker)
            return this._worker.kill();
    }
}