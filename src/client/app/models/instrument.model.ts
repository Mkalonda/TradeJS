import {InstrumentSettings} from "../../../shared/interfaces/InstrumentSettings";
import {EventEmitter, Output} from "@angular/core";
import {BaseModel} from "./base.model";


export class InstrumentModel extends BaseModel {

    public synced = new EventEmitter();

    data = {
        instrument: '',
        timeFrame: 'M15',
        id: '',
        focus: false,
        indicators: [],
        bars: []
    };


    updateBars(bars) {
        this.data.bars = bars;
    }

    updateIndicators(data) {

    }
}