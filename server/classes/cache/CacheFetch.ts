import * as _           from 'lodash';
import * as util        from './util/util';
import Mapper           from './CacheMap';
import BrokerApi        from '../broker-api/oanda/oanda';
import {splitTimeToChunks, mergeRanges} from '../../util/date';
import CacheDataLayer from "./CacheDataLayer";

const debug             = require('debug')('TradeJS:Fetcher');
11061000
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
        if (from && until) {
            return this._fetchByDateRange(brokerApi, instrument, timeFrame, from, until, count);
        } else {
            return this._fetchByCount(brokerApi, instrument, timeFrame, from, until, count);
        }
    }

    private _fetchByCount(brokerApi: BrokerApi, instrument: string, timeFrame: string, from: number, until: number, count: number) {

        let storedRanges = this._mapper.findByParams(instrument, timeFrame, true);

        util.getGapsInDateRanges(from, until, count, storedRanges);
    }

    private _fetchByDateRange(brokerApi: BrokerApi, instrument: string, timeFrame: string, from: number, until: number, count: number) {

    }

    public async fetch2(brokerApi: BrokerApi, instrument: string, timeFrame: string, from: number, until: number, count: number) {

        let startTime = Date.now(),
            ranges, mergedRanges, chunks, pList;

            ranges      = this._mapper.findByParams(instrument, timeFrame, true).map(range => [range[0], range[1]]);

            // Create new array with pending and 'done' ranges merged
            mergedRanges= mergeRanges(ranges.concat(this._getPendingRequest(instrument, timeFrame)));

            // Find all chunks that are missing and split those chunks again with respect to bar limit
            chunks = _.flatten(util.getGapsInDateRanges(from, until, mergedRanges).map(c =>
                splitTimeToChunks(timeFrame, c.from, c.until, 5000)
            ));

            // Create promise list
            pList = chunks.map(chunk => {
                debug(`Fetching ${instrument} on ${timeFrame} from ${new Date(chunk.from)} until ${new Date(chunk.until)}`);

                // Store chunk date as pending
                this._setPendingRequest(instrument, timeFrame, from, until);

                return brokerApi
                    .getCandles(instrument, timeFrame, chunk.from, chunk.until, count)
                    .then(async candles => {

                        // Write to database
                        await this._dataLayer.write(instrument, timeFrame, candles);

                        // Store in mapper
                        await this._mapper.update(instrument, timeFrame, chunk.from, chunk.until, candles.length);

                        // Remove from pending requests
                        this._clearPendingRequest(instrument, timeFrame, chunk.from, chunk.until);
                        return candles;
                    })
                    .catch(error => {
                        // Remove from pending requests
                        this._clearPendingRequest(instrument, timeFrame, chunk.from, chunk.until);
                        throw error;
                    });
            });

        return Promise.all(pList).then(data => {
            debug('FETCHING END', ((Date.now() - startTime) / 1000) + ' Seconds');

            return {
                candles: _.flatten(data).reverse(),
                chunks: chunks
            }
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