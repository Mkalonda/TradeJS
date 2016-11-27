import * as moment from 'moment';

export default class BarCalculator {

    private _prevTime: number = null;

    onTick(tick) {
        let time = new Date(tick.time);

        //console.log(time);

        if (time) {

        }
    }
}