'use strict';

//const dataController = require('./data-controller');
const utilDate = require('../util/date');

module.exports = (instrument, timeFrame, from, until)  => {
    let returnArr = [];

    // Get list of months missing in current stored data
    utilDate
        .getFullMonthsBetweenDates(from, until)
        .filter(month => true /*!dataController.isFileComplete(instrument, timeFrame, month.year, month.month)*/)
        .forEach(month => {
            returnArr.push(...utilDate.splitTimeToChunks(timeFrame, month.from, month.until, 5000));
        });

    return returnArr;
};