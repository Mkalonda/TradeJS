'use strict';

module.exports = (timeFrame, from, until, candles) => {

    let i = 0, len = candles.length,
        prevCandle, candle;

    for (; i < len; i++) {
        candle = candles[i];

        // First candle, check if from is reached
        if (i === 0) {

        }

        // Last candle, check if until is reached
        if (i === len-1) {

        }

        prevCandle = candle;
    }
};