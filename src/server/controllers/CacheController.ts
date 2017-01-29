import * as path from 'path';
import WorkerHost from '../classes/worker/WorkerHost';

export default class CacheController {

    private _cache: WorkerHost = null;

    constructor(protected opt, protected app) {}

    public init() {
        this._cache = new WorkerHost({
            id: 'cache',
            ipc: this.app._ipc,
            path: path.join(__dirname, '../cache/Cache.js'),
            classArguments: {
                settings: this.app.controllers.config.get()
            }
        });

        this._cache._ipc.on('tick', tick => {
            this.app._io.sockets.emit('tick', tick);
        });

        return this._cache.init();
    }

    public read(instrument, timeFrame, from, until, bufferOnly) {

        return this
            ._cache
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
            ._cache
            .send('fetch', {
                instrument: instrument,
                timeFrame: timeFrame,
                from: from,
                until: until
            });
    }

    public reset() {
        return this
            ._cache
            .send('@reset');
    }

    public async updateSettings(settings) {
        this._cache.send('broker:settings', settings);
    }

    public async destroy() {
        if (this._cache)
            return this._cache.kill();
    }
}