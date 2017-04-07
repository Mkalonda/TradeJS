export class IndicatorModel {

	public name: string;
	public inputs = <any>{};

	constructor(private _options) {
		this.name = _options.name;
		this.inputs = _options.inputs;
	}
}