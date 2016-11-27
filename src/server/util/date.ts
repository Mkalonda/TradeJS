import * as moment from 'moment';

const REQUEST_LIMIT = 5000; // Oanda

/**
 *
 * @type {{S5: number, S10: number, S15: number, S30: number, M1: number, M5: number, M15: number, M30: number, H1: number, H4: number}}
 */
module.exports.timeFrameSteps = {
    'S5': 5000,
    'S10': 10000,
    'S15': 15000,
    'S30': 30000,
    'M1': 60000,
    'M5': 300000,
    'M15': 900000,
    'M30': 1800000,
    'H1': 3600000,
    'H4': 14400000
};

/**
 *
 * @param from
 * @param until
 * @returns {Array}
 */
module.exports.getFullMonthsBetweenDates = (from, until) => {
    let returnArr = [];

    from = moment(from).startOf('month');
    until = moment(until).endOf('month').valueOf();

    do {
        returnArr.push({
            year: from.format('YYYY'),
            month: from.format('MM'),
            from: from.valueOf(),
            until: from.clone().add(1, 'months').valueOf()
        });

    } while (from.add(1, 'months').valueOf() <= until);

    return returnArr;
};

/**
 *
 * @param timeFrame
 * @param from
 * @param until
 * @param chunkLimit
 * @returns {Array}
 */
module.exports.splitTimeToChunks = (timeFrame, from, until, chunkLimit) => {
    let timeStep = this.timeFrameSteps[timeFrame] * chunkLimit,
        returnArr = [];

    while (from < until)
        returnArr.push({
            from: from,
            until: (from+=timeStep) < until ? from : until
        });

    return returnArr
};