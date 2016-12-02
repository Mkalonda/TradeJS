import WorkerChild from '../classes/worker/WorkerChild';
import CacheMapper from '../cache/CacheMap';

const debug       = require('debug')('Instrument');

export default class InstrumentCache extends WorkerChild {

    instrument:any = this.opt.instrument;
    timeFrame:any = this.opt.timeFrame;

    protected listenForNewTick: boolean = true;
    protected tickCount:number = 0;
    protected ticks:any = [];

    protected _map:CacheMapper = new CacheMapper();

    async init() {
        await super.init();
        await this._ipc.connectTo('cache');

        if (this.listenForNewTick) {
            this._toggleNewTickListener(true);
        }
    }

    /**
     *
     * @param from
     * @param until
     */
    async get(from, until) {
        await this.fetch(from, until);

        return this.ticks;
    }

    /**
     *
     * @param candles {Array}
     */
    async set(candles) {
        if (!candles)
            return;


        let i = 0, len = candles.length,
            ticks = this.ticks,
            //onTick = this.onTick,
            candle;

        for (; i < len; i=i+6) {
            ++this.tickCount;

            candle = candles.slice(i, i+6);

            this.ticks.push(candle);

            this.onTick();
        }

        //this.ticks.push(candle);

        this._map.update(this.instrument, this.timeFrame, candles[0], candles[candles.length -6]);
    }

    /**
     *
     * @param from
     * @param until
     * @returns {Promise}
     */
    async fetch(from, until) {
        let chunks = this._map.getMissingChunks(this.instrument, this.timeFrame, from, until),
            pList;

        if (!chunks.length)
            return Promise.resolve();

        pList = chunks.map(c =>
            this._ipc.send('cache', 'read', {
                instrument: this.instrument,
                timeFrame: this.timeFrame,
                from: c.from,
                until: c.until,
                bufferOnly: true
            }));

        await this.set((<any>[].concat).apply(...await Promise.all(pList)));
    }

    /**
     *
     */
    onTick(){
        console.log('super tick function, you should define one in your class!');
    }

    async _toggleNewTickListener(state:boolean) {
        if (state) {
            await this._ipc.send('cache', 'register', {id: this.id, instrument: this.instrument}, true);
        } else {
            await this._ipc.send('cache', 'unregister', {id: this.id, instrument: this.instrument}, true);
            this.listenForNewTick = false;
        }
    }
}