import * as path        from 'path';
import InstrumentCache  from './InstrumentCache';

const PATH_INDICATORS = path.join(__dirname, '../../../shared/indicators');

export default class Instrument extends InstrumentCache {

	private _unique = 0;

	indicators = {};

	async init() {
		await super.init();
		await this._setIPCEvents();
	}

	async tick(timestamp, bid, ask): Promise<void> {
		// Tick indicators
		for (let name in this.indicators) {
			this.indicators[name].onTick(bid, ask);
		}
	}

	toggleTimeFrame(timeFrame) {
		this.timeFrame = timeFrame;

		return this.reset();
	}

	addIndicator(name, options): any {
		let indicator = null;
		options.name = name;

		try {
			let id = name + '_' + ++this._unique;
			let indicatorPath = path.join(PATH_INDICATORS, name, 'index.js');
			indicator = new (require(indicatorPath).default)(this.ticks, options);
			this.indicators[id] = indicator;

			indicator._doCatchUp();
		} catch (err) {
			console.log('Could not add indicator', err);
		}

		return indicator;
	}

	removeIndicator(id) {
		delete this.indicators[id];
	}

	getIndicatorData(id: string, count?: number, shift?: number) {
		return this.indicators[id].getDrawBuffersData(count, shift);
	}

	getIndicatorsData(count: number, shift?: number) {
		let data = {};

		for (let id in this.indicators) {
			data[id] = this.getIndicatorData(id, count, shift);
		}

		return data;
	}

	async _setIPCEvents() {
		this._ipc.on('read', async (data, cb: Function) => {

			try {
				let returnObj = <any>{
					candles: await this.read(data.count, data.offset, data.from, data.until)
				};

				if (data.indicators) {
					returnObj.indicators = await this.getIndicatorsData(data.count, data.offset)
				}

				cb(null, returnObj);
			} catch (error) {
				console.log('Error:', error);
				cb(error);
			}
		});

		this._ipc.on('get-data', async (data: any, cb: Function) => {
			try {
				cb(null, await this.getIndicatorsData(data.count, data.shift));
			} catch (error) {
				console.log('Error:', error);
				cb(error);
			}
		});

		this._ipc.on('indicator:add', async (data: any, cb: Function) => {
			try {
				this.addIndicator(data.name, data.options);
				cb(null, await this.getIndicatorsData(data.count, data.shift));
			} catch (error) {
				console.log('Error:', error);
				cb(error);
			}
		});

		this._ipc.on('toggleTimeFrame', async (data: any, cb: Function) => {
			try {
				cb(null, await this.toggleTimeFrame(data.timeFrame));
			} catch (error) {
				console.log('Error:', error);
				cb(error);
			}
		});
	}

	async reset(keepIndicators = true) {
		let indicators = [];

		for (let id in this.indicators) {
			indicators.push(this.indicators[id].options);
			this.removeIndicator(id);
		}

		await super.reset();

		for (let i = 0; i < indicators.length; ++i) {
			this.addIndicator(indicators[i].name, indicators[i]);
		}
	}
}