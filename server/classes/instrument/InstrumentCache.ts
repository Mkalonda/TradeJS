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
		await this._doPreFetch();

		if (this.options.live) {
			await this._toggleNewTickListener(true);
		}
	}

	public tick(timestamp, bid, ask) {
		console.log('super tick function, you should define one in your class!');
	}

	public read(count = 0, offset = 0, start?: number, until?: number) {
		return this._readyHandler.then(async () => {

			let candles = this.ticks.slice(this.ticks.length - count - offset, this.ticks.length - offset);

			return candles;
		});
	}

	private async _doPreFetch() {

		let ticks = await this._ipc.send('cache', 'read', {
				instrument: this.instrument,
				timeFrame: this.timeFrame,
				until: this.options.live ? this.options.until :  this.options.from,
				count: 1000,
				bufferOnly: true
			});

		await this._doTickLoop(ticks, false);
	}

	private _doTickLoop(candles, tick = true) {

		return new Promise((resolve, reject) => {
			if (!candles.length) {
				return resolve();
			}

			this._map.update(this.instrument, this.timeFrame, candles[0], candles[candles.length - 6], candles.length);

			let loop = (i) => {

				process.nextTick(async () => {

					let candle = candles.slice(i, i = i + 6);

					// Quality check, make sure every tick has a timestamp AFTER the previous tick
					// (Just to be sure)
					if (this.ticks.length && this.ticks[this.ticks.length - 1][0] >= candle[0]) {
						console.log('TIME STAMP DIFF', this.ticks[this.ticks.length - 1][0], candle[0], 'TICK COUNT', this.ticks.length);
						throw new Error('Candle timestamp is not after previous timestamp');
					}

					// uncompleted candles (last one)
					// TODO: What to do in this situation?
					if (candle.length !== 6) {
						resolve();
						return;
					}

					this.ticks.push(candle);

					if (tick) {
						++this.tickCount;

						await this.tick(candle[0], candle[1], candle[2]);
					}

					if (candles[i + 1]) {
						loop(i);
					} else {
						resolve();
						return;
					}
				});
			};

			if (candles.length)
				loop(0);
			else
				resolve();
		});
	}

	protected inject(candles) {
		return this._doTickLoop(candles);
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