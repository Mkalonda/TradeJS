import * as _           from 'lodash';
import * as util        from './util/util';
import Mapper           from './CacheMap';
import BrokerApi        from '../broker-api/oanda/oanda';
import {splitTimeToChunks, mergeRanges} from '../../util/date';
import CacheDataLayer from './CacheDataLayer';

const debug = require('debug')('TradeJS:Fetcher');

export default class Fetcher {

	private _mapper: Mapper;
	private _dataLayer: CacheDataLayer;

	private _pendingRanges: any = {};

	// TODO: Add queue per instrument;
	private _queue: any;

	constructor(opt) {
		this._mapper = opt.mapper;
		this._dataLayer = opt.dataLayer;
	}

	async init() {}

	public async fetch(brokerApi: BrokerApi, instrument: string, timeFrame: string, from: number, until: number, count: number) {
		
		debug(`Fetching ${instrument} on ${timeFrame} from ${new Date(from)} until ${new Date(until)} count ${count}`);

		// Store chunk date as pending
		// this._setPendingRequest(instrument, timeFrame, from, until);

		return brokerApi.getCandles(instrument, timeFrame, from, until, count).then(async candles => {

			// Write to database
			await this._dataLayer.write(instrument, timeFrame, candles);

			if (from && until) {
				await this._mapper.update(instrument, timeFrame, from, until, candles.length);
			} else {
				if (candles.length) {
					if (!from) {
						from = candles[0].time;
					}

					if (!until) {
						until = candles[candles.length - 1].time;
					}

					if (from && until) {
						await this._mapper.update(instrument, timeFrame, from, until, candles.length);
					}
				}
			}

			// Remove from pending requests
			// this._clearPendingRequest(instrument, timeFrame, from, until);

			return candles;

		}).catch(error => {
			// Remove from pending requests
			// this._clearPendingRequest(instrument, timeFrame, from, until);
			throw error;
		});
	}

	private _getPendingRequest(instrument, timeFrame) {
		if (!this._pendingRanges[instrument] || !this._pendingRanges[instrument][timeFrame])
			return [];

		return this._pendingRanges[instrument];
	}

	private _setPendingRequest(instrument, timeFrame, from, until) {
		if (!this._pendingRanges[instrument])
			this._pendingRanges[instrument] = {};

		if (!this._pendingRanges[instrument][timeFrame])
			this._pendingRanges[instrument][timeFrame] = [];

		this._pendingRanges[instrument][timeFrame].push([from, until]);
	}

	private _clearPendingRequest(instrument, timeFrame, from, until) {
		let pending = this._pendingRanges[instrument][timeFrame],
			i = 0, len = pending.length;

		for (; i < len; i++) {
			if (pending[i] && pending[i][0] === from && pending[i][1] === until)
				pending.splice(i, 1);
		}
	}
}