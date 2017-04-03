import EA from '../../../server/classes/ea/EA';
import {IEA} from 'tradejs/ea';

export default class MyEA extends EA implements IEA {

	count = 0;
	MA1: any;

	public async init(): Promise<any> {
		await super.init();

		this.MA1 = this.addIndicator('MA', {
			color: 'blue'
		});
	}

	public async onTick(timestamp, bid, ask): Promise<void> {
		await super.onTick(timestamp, bid, ask);

		console.log('this.MA1.value this.MA1.value ', this.MA1.value);

		console.log(this.MA1.value);

		if (this.count++ < 2) {

			await this.orderManager.add({
				instrument: this.instrument,
				count: 1,
				type: 'se',
				bid: bid,
				ask: ask
			});
		}

		if (this.count > 1440) {
			if (this.orderManager.orders.length)
				await this.orderManager.close(this.orderManager.orders[0].id, bid, ask);
		}
	}

}