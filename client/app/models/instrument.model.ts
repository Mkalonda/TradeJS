import {EventEmitter} from '@angular/core';
import {BaseModel} from './base.model';
import {InstrumentSettings} from '../../../shared/interfaces/InstrumentSettings';

export class InstrumentModel extends BaseModel {

    public synced = new EventEmitter();

    public data = <InstrumentSettings> {
        instrument: '',
        timeFrame: 'M15',
        id: '',
        focus: false,
        indicators: [],
        bars: [],
        live: true
    };

    constructor(data?: any) {
        super();

        this.set(data);
    }


    updateBars(bars) {
        this.data.bars = bars;
    }

    updateIndicators(data) {

    }
}