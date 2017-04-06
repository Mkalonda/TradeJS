import Indicator from '../Indicator';

export interface IInputs {
	period: number;
	shift?: number;
}

export default class MA extends Indicator {

	public get value() {
		return this.getDrawBuffersData(undefined, undefined, false)['MA'].data[0][1];
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
		if (this.ticks.length < (this.options.period + shift))
			return;

		let ticks = this.ticks.slice((this.ticks.length - shift) - this.options.period, this.ticks.length - shift);

		let time = ticks[ticks.length - 1][0],
			sum = 0, i = 0, len = ticks.length;

		for (; i < len; i++) {
			sum += ticks[i][2];
		}

		this.add('MA', time, Number((sum / len).toFixed(4)));
	}
}