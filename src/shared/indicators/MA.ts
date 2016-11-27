import Indicator from "./Indicator";
import test       from '../instrument/test';

export default class MA extends Indicator {

    init() {
        this.addDrawBuffer({
            id: 'MA',
            type: 'line',
            style: {
                color: 'red'
            }
        });
    }

    onTick(shift:number = 0) {
        let length = 20,
            ticks = this.ticks.slice((this.ticks.length - shift) - length, this.ticks.length - shift);

        if (!ticks.length || ticks.length < length) {
            if (this.ticks[this.ticks.length - shift])
                return this.add('MA', this.ticks[this.ticks.length - shift][0], undefined);
        }


        let time = ticks[ticks.length-1][0];

        let sum = 0, i = 0, len = ticks.length;

        for(; i < len; i++) {
            sum += ticks[i][2];
        }

        this.add('MA', time, Number((sum/len).toFixed(4)));
    }
}