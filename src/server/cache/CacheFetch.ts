import * as _           from 'lodash';
import * as util        from './util/util';
import Mapper           from "./CacheMap";
import BrokerApi        from "../broker-api/oanda";
import * as mergeRanges from 'merge-ranges';

const utilDate  = require('../util/date');
const debug     = require('debug')('TradeJS:Fetcher');

export default class Fetcher {

    private _mapper: Mapper;

    private _pendingRanges: any = {};

    constructor(opt) {
        this._mapper = opt.mapper;
    }

    async init() {}

    public async fetch(brokerApi: BrokerApi, instrument: string, timeFrame: string, from: number, until: number) {

        let startTime   = Date.now(),
            ranges      = this._mapper.findByParams(instrument, timeFrame, true),

            // Create new array with pending and 'done' ranges merged
            mergedRanges= mergeRanges(ranges.concat(this._getPendingRequest(instrument, timeFrame))),

            // Find all chunks that are missing and split those chunks again with respect to bar limit
            chunks = _.flatten(util.getGapsInDateRanges(from, until, mergedRanges).map(c =>
                utilDate.splitTimeToChunks(timeFrame, c.from, c.until, 5000)
            )),

            // Create promise list
            pList = chunks.map(chunk => {
                debug(`Fetching ${instrument} on ${timeFrame} from ${new Date(chunk.from)} until ${new Date(chunk.until)}`);

                // Store chunk date as pending
                this._setPendingRequest(instrument, timeFrame, from, until);

                return brokerApi
                    .getCandles(instrument, timeFrame, chunk.from, chunk.until)
                    .then(candles => {
                        // Remove from pending requests
                        this._clearPendingRequest(instrument, timeFrame, from, until);
                        return candles;
                    })
                    .catch(error => {
                        // Remove from pending requests
                        this._clearPendingRequest(instrument, timeFrame, from, until);
                        throw error;
                    });
            });

        return Promise.all(pList).then(data => {
            debug("FETCHING END", ((Date.now() - startTime) / 1000) + ' Seconds');

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