import * as _   from 'lodash';
import Base     from '../../classes/Base';
import AccountManager from '../account/AccountManager';

export interface IOrder {
	instrument: string;
	count: number;
	type: string;
	id?: number | string;
	bid?: number;
	ask?: number;
	takeProfit?: number;
	takeLoss?: number;
	openTime?: number;
	closeTime?: number;
}

export default class OrderManager extends Base {

	private _orders = [];
	private _closedOrders = [];
	private _unique = 0;

	public get orders() {
		return this._orders;
	}

	public get closedOrders() {
		return this._closedOrders;
	}

	constructor(private _accountManager: AccountManager,
				protected opt?) {
		super(opt)
	}

	public async init() {
	}

	public add(order: IOrder) {
		// TODO: Debug warning 'Not enough funds'
		let orderPrice = this._calculateOrderPrice(order);

		if (this._accountManager.equality < orderPrice) {
			console.log('NOT ENOUGH FUNDS');
			return;
		}

		order.id = this._unique++;
		order.openTime = Date.now();

		if (this.options.live) {

		} else {
			this._orders.push(order);
			this._accountManager.addEquality(-orderPrice);
		}

		return order.id;

	}

	public findById(id) {
		return _.find(this._orders, {id})
	}

	public close(id: number, bid: number, ask: number) {
		let order = _.remove(this._orders, {id})[0];

		// TODO: Debug warning 'Order not found)
		if (!order) {
			return false;
		}

		// TODO: Send to broker
		if (this.options.live) {

		} else {
			order.closeTime = Date.now();
			order.profit = order.ask - bid;
			order.equality = this._accountManager.equality;
			this._accountManager.addEquality(order.bid);
			this._closedOrders.push(order);
		}
	}

	public update() {

	}

	public tick() {

	}

	public checkOrderEquality(order: IOrder): boolean {
		let required = order.count * order.ask;
		return;
	}

	private _calculateOrderPrice(order: IOrder): number {
		return order.count * order.ask;
	}

	private _calculateOrderProfit(order: IOrder, bid: number, ask: number) {
		return order.ask - bid;
	}
}