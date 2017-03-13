import WorkerChild from '../worker/WorkerChild';
import CacheMapper from '../cache/CacheMap';
import * as utilDate from '../../util/date';

const debug = require('debug')('Instrument');

export default class InstrumentCache extends WorkerChild {

    public instrument: string = this.opt.instrument;
    public timeFrame: string = this.opt.timeFrame;

    protected tickCount: number = 0;
    protected ticks: any = [];

    protected _map: CacheMapper = new CacheMapper();

    protected from: number;
    protected until: number;

    private _readyHandler = Promise.resolve();

    public async init() {
        await super.init();

        await this._ipc.connectTo('cache');

        await this._fetch(1000);

        if (this.options.live) {
            this._toggleNewTickListener(true);
        }

        this._readyHandler.then(async () => {

        });
    }

    public onTick(timestamp, bid, ask) {
        console.log('super tick function, you should define one in your class!');
    }

    public read(count = 0, offset = 0, start?: number, until?: number) {
        return this._readyHandler.then(async () => {

            await this._fetch(count + offset);

            return this.ticks.slice(this.ticks.length - count - offset, this.ticks.length - offset);
        });
    }

    public async _fetch(count, backwards = true, from?: number, until?: number) {
        let nrMissing = count - this.ticks.length;

        if (nrMissing < 0)
            return;

        if (backwards) {
            until = until || (this.ticks.length ? this.ticks[0][0] : undefined);
        } else {
            from = from || this.ticks[0][0];
        }

        let resultArr = await this._ipc.send('cache', 'read', {
            instrument: this.instrument,
            timeFrame: this.timeFrame,
            from: from,
            until: until,
            count: nrMissing,
            bufferOnly: true
        });

        return this._set(resultArr);
    }

    private _set(candles) {

        return new Promise((resolve, reject) => {
            let from = this.from,
                until = this.until,
                candle;

            if (!candles.length) {
                return resolve('end');
            }

            this._map.update(this.instrument, this.timeFrame, candles[0], candles[candles.length - 6], candles.length);

            let loop = (i) => {

                process.nextTick(async () => {

                    candle = candles.slice(i, i + 6);

                    if (until && candle[0] > until) {
                        return resolve('end');
                    }

                    ++this.tickCount;

                    this.ticks.push(candle);


                    await this.onTick(candle[0], candle[1], candle[2]);

                    i = i + 6;

                    if (candles[i + 1]) {
                        loop(i);
                    } else {
                        resolve();
                    }
                });
            };

            if (candles.length)
                loop(0);
            else
                resolve();
        });
    }

    private _doTickLoop() {

    }

    private async _ensureDataLoaded(count, dir = 'back') {

        let max = 50;

        while (this.ticks.length < count && --max) {

            let first = this.ticks[0][0];


            // await this._fetch(null, null, );
        }


        if (this.ticks.length < count) {

            if (this.ticks.length) {
                // Get first timestamp

            }


        }
    }

    private async _toggleNewTickListener(state: boolean) {
        if (state) {
            await this._ipc.send('cache', 'register', {id: this.id, instrument: this.instrument}, true);
        } else {
            await this._ipc.send('cache', 'unregister', {id: this.id, instrument: this.instrument}, true);
            // this.listenForNewTick = false;
        }
    }

    // TODO: on destroy graceful
    protected async onDestroy() {
        await this._toggleNewTickListener(false);
    }
}