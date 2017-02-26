import * as moment from 'moment';

const REQUEST_LIMIT = 5000; // Oanda

export const timeFrameSteps = {
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


export function splitTimeToChunks (timeFrame, from, until, chunkLimit) {
    let timeStep = this.timeFrameSteps[timeFrame] * chunkLimit,
        returnArr = [];

    while (from < until)
        returnArr.push({
            from: from,
            until: (from+=timeStep) < until ? from : until
        });

    return returnArr;
}

// TODO: STOLEN FROM NPM MERGE-RANGES
export function mergeRanges(ranges) {
    if (!(ranges && ranges.length)) {
        return [];
    }

    // Stack of final ranges
    var stack = [];

    // Sort according to start value
    ranges.sort(function(a, b) {
        return a[0] - b[0];
    });

    // Add first range to stack
    stack.push(ranges[0]);

    ranges.slice(1).forEach(function(range, i) {
        var top = stack[stack.length - 1];

        if (top[1] < range[0]) {

            // No overlap, push range onto stack
            stack.push(range);
        } else if (top[1] < range[1]) {

            // Add bars counter
            if (typeof range[1][2] === 'number') {
                range[1][2] += top[1][2];
            }

            // Update previous range
            top[1] = range[1];
        }
    });

    return stack;
};