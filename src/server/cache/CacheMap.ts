import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as util from './util/util';
import * as mkdirp from 'mkdirp';
import * as mergeRanges from 'merge-ranges';
import * as rmdir from 'rmdir';

export default class Mapper {

    private _map: any = {};

    public get map() {
        return this._map;
    }

    constructor(private options:any = {}) {}

    public async init() {
        if (this.options.path) {
            this.options.path = path.join(this.options.path, 'database.map.json');
            return this._loadFromFile();
        }
    }

    public update(instrument, timeFrame, from, until) {
        return new Promise((resolve, reject) => {

            let map = this.map,
                ranges = this.findByParams(instrument, timeFrame, true);

            // Find first index of from date that is higher or equal then new chunk from date
            // Place it before that, so all dates are aligned in a forward manner
            let index = _.findIndex(ranges, date => date[0] > from);

            // If one is higher, prepend
            if (index > -1)
                ranges.splice(index, 0, [from, until]);

            // Put at end of array, making sure lower from dates stay at the start of array
            else
                ranges.push([from, until]);

            // Glue the cached dates together
            map[instrument][timeFrame] = mergeRanges(ranges);

            // Persistent mode
            if (!this._map)
                fs.writeFileSync(this.options.path, JSON.stringify(map, null, 2));

            resolve();
        });
    }

    findHoles(instrument, timeFrame, from, until) {
        return util.getGapsInDateRanges(from, until, this.getMapInstrumentList(instrument, timeFrame));
    }

    public async reset(instrument?:string, timeFrame?:string) {

        return new Promise((resolve, reject) => {

            if (this._map) {
                this._map = {};
                return resolve();
            }

            // Remove cache dir recursive
            rmdir(this.options.path, () => {

                // Recreate cache dir
                mkdirp(this.options.path, () => {
                    resolve();
                })
            })
        });
    }

    public findByParams(instrument: string, timeFrame: string, create = true): Array<any> {
        let map = this.map;

        if (map[instrument])
            if (map[instrument][timeFrame])
                return map[instrument][timeFrame];

        if (create) {
            if (!map[instrument])
                map[instrument] = {};

            if (!map[instrument][timeFrame])
                map[instrument][timeFrame] = [];

            return map[instrument][timeFrame];
        }

        return null;
    }

    getMapInstrumentList(instrument, timeFrame) {
        let map = this.map;

        return map[instrument] && map[instrument][timeFrame] ? map[instrument][timeFrame]: [];
    }

    private _loadFromFile() {
        return new Promise((resolve, reject) => {

            fs.readFile(this.options.path, (err, content) => {

                try {
                    this._map = JSON.parse(content.toString());
                } catch (error) {
                    console.warn('Cache: mapping file corrupted');
                }

                resolve();
            });
        });

    }
}
