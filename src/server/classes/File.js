'use strict';

const fs        = require('fs');
const path      = require('path');
const mkdirp    = require('mkdirp');
const utilArray = require('../util/array');
const splice    = require('buffer-splice');
const utilCache = require('../cache/util/util');

const ROW_SIZE_TICKS = 3;
const ROW_SIZE_BARS = 6;
const BUFFER_SIZE = 10000;

class FileController {

    constructor(instrument, timeFrame, year, month, cachePath) {
        this.type = timeFrame ? 'bars' : 'ticks';
        this.instrument = instrument;
        this.timeFrame = timeFrame;
        this.year = year;
        this.month = month;

        this.cachePath = cachePath;

        this.filePath = this.getFilePath();
    }

    read() {

        return new Promise((resolve, reject) => {

            let buffs = [],
                chunkSize = this.getChunkSize();

            // TODO: slow to check every time
            // Return empty buffer when file does not exists
            if (!fs.existsSync(this.filePath)) {
                //console.warn('Data file does not exists', this.filePath);
                return resolve(new Buffer(0));
            }


            fs
                .createReadStream(this.filePath, {highWaterMark: chunkSize})
                .on('data', chunk => {
                    buffs.push(chunk)
                })
                .on('close', () => {
                    let buffer = Buffer.concat(buffs);
                    resolve(buffer);
                });
        });
    }

    readLineByLine(from, until, cb) {

        return new Promise((resolve, reject) => {

            if (!fs.existsSync(this.filePath)) {
                console.warn('Data file does not exists', this.filePath);
                return resolve();
            }

            let forceClose = false,
                rs;

            rs = fs
                .createReadStream(this.filePath, {highWaterMark: this.getChunkSize()})
                .on('data', chunk => {
                    console.log('byteLength', chunk.byteLength);
                    let ticks = new Float64Array(chunk.buffer, chunk.byteOffset, chunk.byteLength / 8),
                        i = 0, len = ticks.length,
                        time, open, high, low, close, volume;

                    for (; i < len; i=i+6) {
                        time = ticks[i];
                        //triggers = '' + ticks[i];

                        if (from && time < from) {
                            i=i+5; // Count up index until next 'row'
                            continue;
                        }

                        if (until && time > until) {
                            forceClose = true;
                            return rs.close();
                        }

                        // open = ticks[i++];
                        // high = ticks[i++];
                        // low = ticks[i++];
                        // close = ticks[i++];
                        // volume = ticks[i];

                        cb(ticks.slice(i, i+6));
                        // }
                    }
                })
                //.on('error', reject)
                .on('close', resolve);
        });
    }

    write(candles) {

        return new Promise((resolve, reject) => {

            // Ensure file root directory exists
            mkdirp.sync(path.dirname(this.filePath));

            let self = this,
                firstInsertDate = candles[0],
                lastInsertDate = candles[candles.length - ROW_SIZE_BARS];

            candles = utilArray.arrayToFloat64Buffer(candles);

            self.read().then(buffer => {

                let insertRanges = utilCache.getDateRangeIndexesInBuffer(buffer, firstInsertDate, lastInsertDate),
                    newBuffer = utilCache.injectBufferIntoBuffer(buffer, insertRanges.start, candles),
                    //newBuffer = splice(buffer, insertRanges.start, insertRanges.remove, candles),
                    ws = fs.createWriteStream(this.filePath);

                ws.once('open', () => {
                    ws.once('error', reject);
                    ws.once('finish',resolve);
                    ws.write(newBuffer);
                    ws.end();
                });
            });
        });
    }

    getChunkSize() {
        if (this.type === 'tick') {
            return BUFFER_SIZE * ROW_SIZE_TICKS * Float64Array.BYTES_PER_ELEMENT;
        } else {
            return BUFFER_SIZE * ROW_SIZE_BARS * Float64Array.BYTES_PER_ELEMENT;
        }
    }

    getFilePath(instrument, timeFrame, year, month) {
        return `${this.cachePath}/${this.type}/${this.instrument}/${this.year}/${this.month}_${this.timeFrame}.${this.type}`;
    }
}

module.exports = FileController;