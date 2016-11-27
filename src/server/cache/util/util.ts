import * as path from 'path';

const PATH_DATA = path.join(__dirname, '/../../../../cache/bars');

/**
 *
 * Build path to correct file
 *
 * @param instrument
 * @param timeFrame
 * @param year
 * @param month
 * @returns {string}
 */
module.exports.getDataFilePath = (instrument, timeFrame, year, month) => {
    return `${PATH_DATA}/${instrument}/${year}/${month}_${timeFrame}.bars`;
};

/**
 *
 * Looks for gaps between date ranges
 *
 * @param from {Number}
 * @param until {Number}
 * @param ranges {Array}
 * @returns {Array}
 */
module.exports.getGapsInDateRanges = (from:number, until:number, ranges: Array<{}> = []) => {
    let chunks = [],
        i = 0, len = ranges.length, range,
        _from = from;

    if (!len) {
        chunks.push({from: from, until: until});
        return chunks;
    }

    for (; i < len; i++) {
        range = ranges[i];

        // Cache is complete or from is higher then until, we can stop looping
        if (range.from <= from && range.until >= until) {
            _from = until;
            break;
        }

        // Range hasn't gotten to from date yet, so continue
        if (range.until < from)
            continue;

        // This range is lower then the current _from time, so we can go ahead to its until time
        if (range.from <= _from) {
            _from = range.until;
        }
        // This range is higher then the current _from time, so we are missing a piece
        else {
            //console.info('missing piece', new Date(_from), new Date(range.from));

            chunks.push({
                from: _from,
                until: range.from
            });

            _from = range.until;
        }
    }

    // Final piece (if required)
    if (_from < until) {
        chunks.push({
            from: _from,
            until: until
        });
    }

    return chunks;
};

/**
 *
 * Looks for missing bars
 *
 * @param timeFrame
 * @param from
 * @param until
 * @param candles
 */
module.exports.fillMissingCandles =  (timeFrame, from, until, candles) => {
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

/**
 *
 * @param instrument
 * @param timeFrame
 * @param list
 */
module.exports.glueRangeDates = (instrument, timeFrame, ranges) => {
    let prevUntil = null,
        i = 0, len = ranges.length,
        date;

    for (; i < len; i++) {
        date = ranges[i];

        // From date matches, glue 2 dates together
        if (date.from === prevUntil) {
            // Set previous until to current until
            ranges[i-1].until = date.until;

            // Remove current date fromt he list
            ranges.splice(i, 1);

            // Set the loop back 1 counter
            i--;
            len--;
        }

        prevUntil = date.until;
    }
};

/**
 *
 * Calculates the start - end index for a date range within a buffer
 * Used when inserting data into buffer, and want to find the the start/end index for .splice
 *
 * @param buffer
 * @param from
 * @param until
 * @returns {{start: number, end: number}}
 */
module.exports.getDateRangeIndexesInBuffer = (buffer, from, until) => {

    let candles = new Float64Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 8),
        i = 0, len = candles.length,
        startIndex = 0,
        endIndex = 0, date;

    // There are no candles, or first stored candle is later then latest inserted candle,
    // so always start at 0
    if (!candles.length || candles[0] >= until) {
        return {
            start: 0,
            remove: 0
        };
    }

    // If last candle is earlier then first inserting candle, start at last index (basically pushing on to array)
    if (candles[len - 6] < from) {
        return {
            start: len * 6 * Float64Array.BYTES_PER_ELEMENT,
            remove: 0,
        }
    }

    // Find the correct position to insert
    // Looks for the start end finish index, removes that from the
    for (; i < len; i=i+6) {
        date = candles[i];

        if (!startIndex && date >= from) {
            startIndex = i * Float64Array.BYTES_PER_ELEMENT;
        }

        if (!endIndex && date >= until) {
            endIndex = i * Float64Array.BYTES_PER_ELEMENT;
        }
    }

    return {
        start: startIndex,
        remove: endIndex
    }
};

/**
 * Quick function to check if buffer length is correct
 *
 * @param buffer
 * @param expectedLength
 */
module.exports.isBufferElementsLength = (buffer, expectedLength) => {
    let tArr = new Float64Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 8);

    return tArr.length === expectedLength;
};

module.exports.injectBufferIntoBuffer = (mainBuffer, startIndex, buff) => {
    let first = mainBuffer.slice(0, startIndex),
        last = mainBuffer.slice(startIndex, mainBuffer.byteLength);

    return Buffer.concat([first, buff, last]);
};