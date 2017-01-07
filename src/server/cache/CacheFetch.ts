import * as _           from 'lodash';
import Mapper           from "./CacheMap";
import BrokerApi        from "../broker-api/oanda";

const utilDate  = require('../util/date');
const debug     = require('debug')('TradeJS:Fetcher');

export default class Fetcher {

    mapper: Mapper;

    constructor(opt) {
        this.mapper = opt.mapper;
    }

    async init() {}

    fetch(brokerApi: BrokerApi, instrument: string, timeFrame: string, from: number, until: number) {

        let chunks = this.mapper.getMissingChunks(instrument, timeFrame, from, until),
            chunksLimit = [], pList;

        chunks.forEach(chunk => {
            chunksLimit.push(...utilDate.splitTimeToChunks(timeFrame, chunk.from, chunk.until, 5000));
        });

        pList = chunksLimit.map(chunk => {
            debug(`Fetching ${instrument} on ${timeFrame} from ${new Date(chunk.from)} until ${new Date(chunk.until)}`);

            return brokerApi.getCandles(instrument, timeFrame, chunk.from, chunk.until);
        });

        return Promise.all(pList).then(data => {
            return {
                candles: _.flatten(data).reverse(),
                chunks: chunks
            }
        });
    };
}