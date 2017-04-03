import Instrument from '../instrument/Instrument';
import OrderManager from '../../modules/order/OrderManager';
import AccountManager from '../../modules/account/AccountManager';

export interface IEA {
	orderManager: OrderManager;
	onTick(timestamp, bid, ask): Promise<void>;
}

export default class EA extends Instrument implements IEA {

	public tickCount = 0;
	public live = false;

	public accountManager: AccountManager;
	public orderManager: OrderManager;

	protected from: number;
	protected until: number;

	public async init() {
		this.accountManager = new AccountManager({
			equality: this.options.equality
		});

		this.orderManager = new OrderManager(this.accountManager, {
			live: this.live
		});

		await this.accountManager.init();
		await this.orderManager.init();

		console.log('this.options this.options', this.options);

		await super.init();

		console.log('this.options this.options', this.options);

		// TODO: Move to backtest class


		this._ipc.on('@run', opt => this.runBackTest(opt.from, opt.until));
		this._ipc.on('@report', (data, cb) => cb(null, this.report()));
	}

	async runBackTest(from: number, until: number): Promise<any> {

		let count = 2000,
			candles, lastTime;

		this.from = from;
		this.until = until;

		while (true) {

			candles = await this._ipc.send('cache', 'read', {
				instrument: this.instrument,
				timeFrame: this.timeFrame,
				from: from,
				count: count,
				bufferOnly: true
			});

			// There is no more data, so stop
			if (!candles.length)
				break;

			lastTime = candles[candles.length - 6];

			// See if until is reached in this batch
			if (lastTime > until) {
				break;
			}

			await this.inject(candles);

			// There are no more candles to end
			if (candles.length * 6 < count)
				break;

			from = lastTime;
		}

		this._ipc.send('main', '@run:end', undefined, false);
	}

	report() {
		return {
			tickCount: this.tickCount,
			equality: this.accountManager.equality,
			orders: this.orderManager.closedOrders

		};
	}

	async onTick(timestamp, bid, ask): Promise<void> {
		await super.onTick(timestamp, bid, ask);

		if (this.live === false) {
			// this.orderManager.tick()
		}
	}

	private _fetchAndExecuteTickBatch() {
		return this._fetch(2000)
	}
}