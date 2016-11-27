import * as _           from 'lodash';
import Mapper           from "./CacheMap";
import BrokerApi        from "../broker-api/oanda";

const utilDate  = require('../util/date');
const debug     = require('debug')('TradeJS:Fetcher');

export default class Fetcher {

    mapper: Mapper;
    brokerApi: BrokerApi;

    constructor(opt) {
        this.mapper = opt.mapper;
        this.brokerApi = opt.brokerApi
    }

    async init() {}

    fetch(instrument, timeFrame, from, until) {

        let chunks = this.mapper.getMissingChunks(instrument, timeFrame, from, until),
            chunksLimit = [], pList;

        chunks.forEach(chunk => {
            chunksLimit.push(...utilDate.splitTimeToChunks(timeFrame, chunk.from, chunk.until, 5000));
        });

        pList = chunksLimit.map(chunk => {
            debug(`Fetching ${instrument} on ${timeFrame} from ${new Date(chunk.from)} until ${new Date(chunk.until)}`);

            return this.brokerApi.getCandles(instrument, timeFrame, chunk.from, chunk.until);
        });

        return Promise.all(pList).then(data => {
            return {
                candles: _.flatten(data).reverse(),
                chunks: chunks
            }
        });
    };
}