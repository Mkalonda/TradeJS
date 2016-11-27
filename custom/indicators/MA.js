'use strict';

const Indicator = require('../classes/Indicator');

class MA extends Indicator {

    constructor(opt) {
        super(opt);

        this.addDrawBuffer('MA', 'line');
    }

    onTick() {
        this.value = 12;
        this.add('MA', this.value);
    }
}

module.exports = MA;