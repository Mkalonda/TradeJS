interface IDrawBufferSettings {
	id: string,
	type: string,
	data?: Array<any>,
	style?: { color?: string, width?: number }
}

export default class Indicator {

	options: any = {};
	drawBuffers: Object = {};

	constructor(protected ticks, private _inputs = <any>{}) {
		this._setInputs(_inputs);

		this.init();
	}

	private _setInputs(inputs) {
		for (let i = 0, len = inputs.length; i < len; i++) {
			this.options[inputs[i].name] = inputs[i].value;
		}
	}

	async init(): Promise<any> {
	}

	add(id, time, data): void {
		this.drawBuffers[id].data.push([time, data]);
	}

	addDrawBuffer(settings: IDrawBufferSettings): void {
		if (this.drawBuffers[settings.id])
			throw new Error(`Buffer with name [${settings.id}] already set!`);

		settings.data = settings.data || [];
		this.drawBuffers[settings.id] = settings;
	}

	getDrawBuffersData(count = 1, shift = 0, includeInfo = true): {} {
		let data = {},
			buffLength, drawBuffer;

		for (let id in this.drawBuffers) {
			if (this.drawBuffers.hasOwnProperty(id)) {
				drawBuffer = this.drawBuffers[id];
				buffLength = drawBuffer.data.length;

				data[id] = <IDrawBufferSettings>{
					id: drawBuffer.id,
					type: drawBuffer.type,
					style: drawBuffer.style,
					// data: this.drawBuffers[id].data.slice(0, buffLength - shift)
					data: drawBuffer.data.slice(buffLength - count, buffLength)
				};
			}
		}

		return data;
	}

	_doCatchUp(): void {
		let len = this.ticks.length,
			i = 0, tick;

		for (; i < len; i++) {
			tick = this.ticks[i];
			this.onTick(tick[0], tick[1], len - i);
		}
	}

	onTick(bid: number, ask: number, shift: number = 0): Promise<any> | void {

	}
}