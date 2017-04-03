import Indicator from '../Indicator';

export default class MA extends Indicator {

	public get value() {
		return this.getDrawBuffersData(undefined, undefined, false)['MA'].data[0];
	}

	public async init(): Promise<any> {

		this.addDrawBuffer({
			id: 'MA',
			type: 'line',
			style: {
				color: this.options.color
			}
		});
	}

	public onTick(bid: number, ask: number, shift = 0): Promise<any> | void {
		super.onTick(bid, ask, shift);

		let period = this.options.period,
			ticks = this.ticks.slice((this.ticks.length - shift) - period, this.ticks.length - shift);

		if (!ticks.length)
			return;

		if (ticks.length < period) {
			if (this.ticks[this.ticks.length - shift])
				return this.add('MA', this.ticks[this.ticks.length - shift][0], undefined);
		}

		let time = ticks[ticks.length - 1][0],
			sum = 0, i = 0, len = ticks.length;

		for (; i < len; i++) {
			sum += ticks[i][2];
		}


		this.add('MA', time, Number((sum / len).toFixed(4)));
	}
}