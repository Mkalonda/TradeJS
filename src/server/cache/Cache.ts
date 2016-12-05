import * as _       from 'lodash';
import * as fs      from 'fs';
import * as path    from 'path';
import * as mkdirp  from 'mkdirp';
import * as sqLite  from 'sqlite3';

import Mapper       from './CacheMap';
import Fetcher      from './CacheFetch';
import WorkerChild  from "../classes/worker/WorkerChild";
import BrokerApi    from "../broker-api/oanda";
import BarCalculator from "./util/bar-calculator";

//const sqlLite     = require('sqlite3').verbose();

export default class Cache extends WorkerChild {

    public settings: {account: AccountSettings, path: any} = this.opt.settings;

    private _pathDb: string = path.join(this.settings.path.cache, 'database.db');
    private _brokerApi: BrokerApi = new BrokerApi(this.settings.account);
    private _mapper: Mapper = new Mapper({path: this.settings.path.cache});
    private _fetcher: Fetcher = new Fetcher({mapper: this._mapper, brokerApi: this._brokerApi});
    private _barCalculater: BarCalculator = new BarCalculator();

    private _listeners = {};
    private _db: any;

    async init() {
        await super.init();

        // Ensure cache dir exists
        mkdirp.sync(this.settings.path.cache);

        await this._openDb();
        await this._brokerApi.init();
        await this._mapper.init();
        await this._fetcher.init();

        await this._setChannelEvents();
        await this._setBrokerApi();

        await this._ipc.startServer();
    }

    async _setBrokerApi() {
        this._setBrokerApiEvents();

        let instruments = await <any>this._brokerApi.getInstruments();

        instruments.forEach(instrument => {
            this._brokerApi.subscribePriceStream(instrument.instrument);
        });
    }

    async read(instrument, timeFrame, from, until, bufferOnly) {

        await this.fetch(instrument, timeFrame, from, until);

        return this._read(instrument, timeFrame, from, until, bufferOnly);
    }

    async write(instrument, timeFrame, candles) {
        return this._write(instrument, timeFrame, candles)
    }

    async fetch(instrument, timeFrame, from, until) {
        let data = await this._fetcher.fetch(instrument, timeFrame, from, until);

        // Write to database
        await this.write(instrument, timeFrame, data.candles);

        // Store in mapping
        return Promise.all(data.chunks.map(chunk => this._mapper.update(instrument, timeFrame, from, until)));
    }

    async reset(instrument?: string, timeFrame?: string, from?: number, until?: number) {

        await this._mapper.reset(instrument, timeFrame);
        await this._closeDb();

        if (fs.existsSync(this._pathDb))
            fs.unlinkSync(this._pathDb);

        await this._openDb();
    }

    _read(instrument: string, timeFrame: string, from: number, until: number, bufferOnly?: boolean, completeOnly: boolean = true) {

        return new Promise((resolve, reject) => {

            let tableName = this._getTableName(instrument, timeFrame),
                columns = ['time', 'openBid', 'highBid', 'lowBid', 'closeBid', 'volume'];

            this._db.all(`SELECT ${columns.join(',')} FROM ${tableName} WHERE time >=${from} AND time <=${until}`, (err, rows) => {

                if (err) {
                    return reject(err);
                }


                let i = 0, len = rows.length,
                    row, returnArr = new Float64Array(rows.length * columns.length);

                for (; i < len; i++) {
                    row = rows[i];
                    returnArr.set(columns.map(v => row[v]), 6 * i);
                    //returnArr.set(Object.values(rows[i]), 6 * i); // Not yet supported
                }

                if (bufferOnly) {
                    //resolve(returnArr.buffer);
                    resolve(Array.from(returnArr));
                } else {
                    resolve(Array.from(returnArr));
                }
            });
        });
    }

    /**
     *
     * @param instrument
     * @param timeFrame
     * @param candles
     * @returns {Promise}
     * @private
     */
    _write(instrument, timeFrame, candles) {
        return new Promise((resolve, reject) => {

            this._createInstrumentTableIfNotExists(instrument, timeFrame)
                .then(tableName => {

                    if (!candles.length)
                        return resolve();

                    this._db.serialize(() => {
                        this._db.run("BEGIN TRANSACTION");

                        let stmt = this._db.prepare(`INSERT OR REPLACE INTO ${tableName} VALUES (?,?,?,?,?,?,?,?,?,?,?)`),
                            i = 0, len = candles.length, candle;

                        for (; i < len; i++) {
                            candle = candles[i];

                            stmt.run([
                                candle.time,
                                candle.openBid,
                                candle.openAsk,
                                candle.highBid,
                                candle.highAsk,
                                candle.lowBid,
                                candle.lowAsk,
                                candle.closeBid,
                                candle.closeAsk,
                                candle.volume,
                                candle.complete
                            ]);

                            if (!candle.complete) {
                                //console.log(candle.time)
                            }
                        }

                        stmt.finalize();

                        this._db.run("END");
                        resolve();
                    });
                })
                .catch(reject);
        });
    }

    /**
     *
     * @param instrument {string}
     * @param timeFrame {string}
     * @returns {Promise}
     * @private
     */
    _createInstrumentTableIfNotExists(instrument, timeFrame) {
        return new Promise((resolve, reject) => {

            this._db.serialize(() => {
                let tableName = this._getTableName(instrument, timeFrame),
                    fields = [
                        'time int PRIMARY KEY',
                        'openBid double',
                        'openAsk double',
                        'highBid double',
                        'highAsk double',
                        'lowBid double',
                        'lowAsk double',
                        'closeBid double',
                        'closeAsk double',
                        'volume int',
                        'complete bool'
                    ];

                this._db.run(`CREATE TABLE IF NOT EXISTS ${tableName} (${fields.join(',')})`, function () {
                    resolve(tableName);
                });
            });
        })
    }

    _getTableName(instrument, timeFrame) {
        return instrument.toLowerCase() + '_' + timeFrame.toLowerCase();
    }

    _setBrokerApiEvents() {
        this._brokerApi.on('connect', api => {

        });

        this._brokerApi.on('disconnect', error => {

        });

        this._brokerApi.on('error', error => {

        });

        this._brokerApi.on('tick', tick => this._broadCastTick(tick));
    }

    _broadCastTick(tick) {
        let connections = this._ipc.sockets,
            tickInstrument = tick.instrument,
            bars = this._barCalculater.onTick(tick);

        this._ipc.send('main', 'tick', tick, false);

        // for (let id in connections)
        //     if (this._listeners[id] === tickInstrument)
        //         this._ipc.send(id, 'tick', tick, false);

    }

    _onRegisterPriceStream() {

    }

    _onUnRegisterPriceStream() {

    }

    _setChannelEvents() {
        this._ipc.on('read', (opt, cb) => {
            if (!opt.until)
                return cb('Error - Cache:read - No until is given');

            this
                .read(opt.instrument, opt.timeFrame, opt.from, opt.until, opt.bufferOnly)
                .then(data => cb(null, data))
                .catch(cb);
        });

        this._ipc.on('fetch', (opt, cb) => {
            this
                .fetch(opt.instrument, opt.timeFrame, opt.from, opt.until)
                .then(data => cb(null, data))
                .catch(cb);
        });

        this._ipc.on('@reset', (opt, cb) => {
            this
                .reset()
                .then(data => cb(null, data))
                .catch(cb);
        });

        this._ipc.on('register', (opt, cb) => {
            this._listeners[opt.id] = opt.instrument;
            cb(null);
        });

        this._ipc.on('unregister', (opt, cb) => {
            delete this._listeners[opt.id];
            cb(null);
        });

        this._ipc.on('settings:update', async(opt, cb) => {
            try {
                cb(null, await this._updateSettings(opt));
            } catch (err) {
                console.error(err);
            }
        });
    }

    _openDb() {
        //this._db = new sqlLite.Database('database.db');
        this._db = new sqLite.Database(this._pathDb);
        //this._db = new sqlLite.Database(':memory:');
    }

    _closeDb() {
        this._db.close();
    }

    _updateSettings(settings) {
        this._brokerApi.updateSettings(settings);
    }
}
