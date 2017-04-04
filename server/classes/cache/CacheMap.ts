import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as mkdirp from 'mkdirp';

const rmdir = require('rmdir');

import {mergeRanges} from '../../util/date';
import {getMissingRangeByCount, getMissingRangeByDate} from './util/util';

export default class Mapper {

	public static readonly MODE_PERSISTENT = 0;
	public static readonly MODE_MEMORY = 1;

	private _map: any = {};
	private _mode: number;
	private _pathFile: string;

	public get map() {
		return this._map;
	}

	public get mode() {
		return this._mode;
	}

	constructor(private options: any = {}) {
	}

	public async init() {
		if (this.options.path) {
			this._mode = Mapper.MODE_PERSISTENT;
			this._pathFile = path.join(this.options.path, 'database-mapper.json');
			await this._loadFromFile();
		} else {
			this._mode = Mapper.MODE_MEMORY;
		}
	}

	public isComplete(instrument, timeFrame, from, until): boolean {
		let ranges = this.findByParams(instrument, timeFrame),
			i = 0, len = ranges.length, _range;

		for (; i < len; ++i) {
			_range = ranges[i];
			if (_range[0] < from && _range[1] > until)
				return true;
		}

		return false;
	}

	public update(instrument, timeFrame, from, until, nrOfBars) {
		return new Promise((resolve, reject) => {

			let map = this.map,
				ranges = this.findByParams(instrument, timeFrame, true);

			// Find first index of from date that is higher or equal then new chunk from date
			// Place it before that, so all dates are aligned in a forward manner
			let index = _.findIndex(ranges, date => date[0] > from);

			// If one is higher, prepend
			if (index > -1)
				ranges.splice(index, 0, [from, until, nrOfBars]);

			// Put at end of array, making sure lower from dates stay at the start of array
			else
				ranges.push([from, until, nrOfBars]);

			// Glue the cached dates together
			map[instrument][timeFrame] = mergeRanges(ranges);

			// Persistent mode
			if (this.mode === Mapper.MODE_PERSISTENT) {

				fs.writeFile(this._pathFile, JSON.stringify(map, null, 2), err => {
					if (err)
						reject(err);

					resolve();
				});
			}
			else {
				resolve();
			}
		});
	}

	public async reset(instrument?: string, timeFrame?: string) {

		return new Promise((resolve, reject) => {

			this._map = {};

			if (this.mode === Mapper.MODE_PERSISTENT) {

				// Remove cache dir recursive
				rmdir(this.options.path, () => {

					// Recreate cache dir
					mkdirp(this.options.path, () => {
						resolve();
					})
				});
			}
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

		return map[instrument] && map[instrument][timeFrame] ? map[instrument][timeFrame] : [];
	}

	private _loadFromFile() {

		return new Promise((resolve, reject) => {

			fs.exists(this._pathFile, (result) => {

				if (result) {

					fs.readFile(this._pathFile, (err, content) => {

						try {
							this._map = JSON.parse(content.toString());
						} catch (error) {
							console.warn('Cache: mapping file corrupted');
						}

						resolve();
					});
				} else {
					resolve();
				}
			});
		});
	}
}
