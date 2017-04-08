'use strict';

export class BacktestSettingsModel {

	constructor(public EA?: any,
				public instruments?: any,
				public timeFrame?: any,
				public from?: any,
				public until?: any,
				public equality?: any,
				public currency?: any,
				public pips?: any) {
	}

	update(opt) {
		Object.assign(this, opt);
	}

	validator() {

	}

	sadf() {

	}
}