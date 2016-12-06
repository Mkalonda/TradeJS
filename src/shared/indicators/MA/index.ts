import Indicator from "../Indicator";

export default class MA extends Indicator {

    async init() {

        this.addDrawBuffer({
            id: 'MA',
            type: 'line',
            style: {
                color: this.options.color
            }
        });
    }

    onTick(shift:number = 0) {
        let period = this.options.period,
            ticks = this.ticks.slice((this.ticks.length - shift) - period, this.ticks.length - shift);

        if (!ticks.length || ticks.length < period) {
            if (this.ticks[this.ticks.length - shift])
                return this.add('MA', this.ticks[this.ticks.length - shift][0], undefined);
        }

        let time = ticks[ticks.length-1][0],
            sum = 0, i = 0, len = ticks.length;

        for(; i < len; i++) {
            sum += ticks[i][2];
        }

        this.add('MA', time, Number((sum/len).toFixed(4)));
    }
}