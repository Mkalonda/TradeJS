'use strict';

export class BacktestSettingsModel {
    // public EA: number;
    // public instruments: string;
    // public timeFrame: string;
    // public from: string;
    // public until: string;
    // public equality: string;
    // public currency: string;
    // public pips: string;

    constructor(
        public EA?: any,
        public instruments?: any,
        public timeFrame?: any,
        public from?: any,
        public until?: any,
        public equality?: any,
        public currency?: any,
        public pips?: any
    ) {}

    update(opt) {
        Object.assign(this, opt);
    }

    validator() {

    }

    sadf() {

    }
}