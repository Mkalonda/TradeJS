'use strict';

const
    _         = require('lodash'),
    fs        = require('fs'),
    path      = require('path'),
    mkdirp    = require('mkdirp'),
    rmdir     = require('rimraf'),
    util      = require('./util/util');

export default class Mapper {

    private map: {} = null;
    private path: string = null;
    private memory: boolean = true;

    constructor(private opt:any = {}) {

        if (this.opt.path) {
            this.path = path.join(this.opt.path, 'database.map.json');
        } else {
            this.map = {};
        }
    }

    async init() {}

    getMissingChunks(instrument, timeFrame, from, until) {
        return util.getGapsInDateRanges(from, until, this.getMapInstrumentList(instrument, timeFrame));
    }

    update(instrument, timeFrame, from, until) {
        return new Promise((resolve, reject) => {

            let map = this.getMap();

            if (!map[instrument]) {
                map[instrument] = map[instrument] || {};
            }

            if (!map[instrument][timeFrame]) {
                map[instrument][timeFrame] = [];
            }

            let ranges = map[instrument][timeFrame];

            // Find first index of from date that is higher or equal then new chunk from date
            // Place it before that, so all dates are aligned in a forward manner
            let index = _.findIndex(ranges, date => date.from > from);

            // If one is higher, prepend
            if (index > -1)
                ranges.splice(index, 0, {from: from, until: until});

            // Put at end of array, making sure lower from dates stay at the start of array
            else
                ranges.push({from: from, until: until});

            // Glue the cached dates together
            util.glueRangeDates(instrument, timeFrame, ranges);

            // Not memory mode
            if (!this.map)
                fs.writeFileSync(this.path, JSON.stringify(map, null, 2));

            resolve();
        });
    }

    reset(instrument?:string, timeFrame?:string) {
        return new Promise((resolve, reject) => {

            if (this.map) {
                this.map = {};
                return resolve();
            }

            // Remove cache dir recursive
            rmdir(this.opt.path, () => {

                // Recreate cache dir
                mkdirp(this.opt.path, () => {
                    resolve();
                })
            })
        });
    }

    getMap(): Object {
        if (this.map) {
            return this.map;
        }

        let map = {};

        if (fs.existsSync(this.path))
            try {
                map = require(this.path);
            } catch (err) {
                console.log('Cache: mapping file corrupted', err)
            }

        return map;
    }

    getMapInstrumentList(instrument, timeFrame) {
        let map = this.getMap();

        return map[instrument] && map[instrument][timeFrame] ? map[instrument][timeFrame]: [];
    }
}
