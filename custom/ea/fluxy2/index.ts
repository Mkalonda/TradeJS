import EA from '../../../server/classes/ea/EA';
import {IEA} from 'tradejs/ea';

export default class MyEA extends EA implements IEA {

	count = 0;
	MA1: any;
	MA2: any;
	MA3: any;
	MA4: any;

	public async onInit(): Promise<any> {

		this.MA1 = this.addIndicator('MA', {
			color: 'yellow',
			period: 30
		});

		this.MA2 = this.addIndicator('MA', {
			color: 'red',
			period: 20
		});

		this.MA3 = this.addIndicator('MA', {
			color: 'purple',
			period: 10
		});

		this.MA4 = this.addIndicator('MA', {
			color: 'orange',
			period: 50
		});
	}

	public async onTick(timestamp, bid, ask): Promise<void> {
		if (this.MA1.value > bid * 1.002) {
			if (!this.orderManager.orders.length) {
				await this.orderManager.add({
					instrument: this.instrument,
					count: 20,
					type: 'se',
					bid: bid,
					ask: ask
				});
			}
		} else {
			if (this.MA1.value < bid && this.orderManager.orders.length)
				await this.orderManager.close(this.orderManager.orders[0].id, bid, ask);
		}
	}

}