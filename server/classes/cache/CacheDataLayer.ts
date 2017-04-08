import * as fs          from 'fs';
import * as sqLite      from 'sqlite3';

const debug = require('debug')('TradeJS:DataLayer');
const TransactionDatabase = require('sqlite3-transactions').TransactionDatabase;

export default class CacheDataLayer {

	private _db: any;
	private _tableList = [];

	constructor(protected options) {
	}

	public async init() {
		await this._openDb();
		return this._setTableList();
	}

	public read(instrument: string, timeFrame: string, from: number, until: number, count = 500, bufferOnly?: boolean): Promise<Array<any>> {

		return this
			._createInstrumentTableIfNotExists(instrument, timeFrame)
			.then(() => {

				return new Promise((resolve, reject) => {

					let tableName = this._getTableName(instrument, timeFrame),
						columns = ['time', 'openBid', 'highBid', 'lowBid', 'closeBid', 'volume'],
						queryString;

					debug(`DataLayer: Read ${tableName} from ${new Date(from)} until ${new Date(until)} count ${count}`);

					queryString = `SELECT ${columns.join(',')}  FROM ${tableName} `;

					if (count) {
						if (until) {
							queryString += `WHERE time <= ${until} ORDER BY time LIMIT ${count} `;
						} else {
							queryString += `WHERE time >= ${from} ORDER BY time LIMIT ${count} `;
						}
					} else {
						count = 300;

						if (from && until) {
							queryString += `WHERE time >= ${from} AND time <= ${until} ORDER BY time DESC LIMIT ${count}`;
						}
						else if (from) {
							queryString += `WHERE time >= ${from} ORDER BY time DESC LIMIT ${count}`;
						}
						else {

						}
					}

					this._db.all(queryString, (err, rows) => {

						if (err) {
							return reject(err);
						}

						let i = 0, len = rows.length,
							row, returnArr = new Float64Array(rows.length * columns.length);

						for (; i < len; i++) {
							row = rows[i];
							returnArr.set(columns.map(v => row[v]), 6 * i);
							// returnArr.set(Object.values(rows[i]), 6 * i); // Not yet supported
						}

						if (bufferOnly) {
							// resolve(returnArr.buffer);
							resolve(Array.from(returnArr));
						} else {
							resolve(Array.from(returnArr));
						}
					});

				});
			});
	}

	public async write(instrument, timeFrame, candles) {

		return new Promise((resolve, reject) => {

			this._createInstrumentTableIfNotExists(instrument, timeFrame)
				.then(tableName => {

					debug('DataLayer: Write ' + candles.length + ' candles to ' + tableName);

					if (!candles.length)
						return resolve();

					this._db.beginTransaction((err, transaction) => {

						let stmt = transaction.prepare(`INSERT OR REPLACE INTO ${tableName} VALUES (?,?,?,?,?,?,?,?,?,?,?)`),
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
								// console.log(candle.time)
							}
						}

						stmt.finalize();

						transaction.commit(function (tErr: any) {
							if (tErr) return reject(tErr);

							resolve();
						});
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
	private _createInstrumentTableIfNotExists(instrument, timeFrame) {
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

	public async reset(instrument?: string, timeFrame?: string, from?: number, until?: number): Promise<void> {
		await this._closeDb();

		if (fs.existsSync(this.options.path))
			fs.unlinkSync(this.options.path);

		await this._openDb();
	}

	// public readLast2() {
	//     setTimeout(() => {
	//         this._db.run(`SELECT * FROM ${tableName} LIMIT 10 OFFSET (SELECT COUNT(*) FROM ${tableName})-10; (${fields.join(',')})`, function () {
	//            console.log()
	//         });
	//     }, 500);
	// }

	private _setTableList() {
		return new Promise((resolve, reject) => {
			this._db.run(`.tables`, (err: any, tableList: Array<any>) => {
				this._tableList = tableList;
				resolve();
			});
		});
	}

	private _getTableName(instrument, timeFrame): string {
		return instrument.toLowerCase() + '_' + timeFrame.toLowerCase();
	}

	private async _openDb() {
		return this._db = new TransactionDatabase(
			new sqLite.Database(this.options.path)
		);
		// this._db = new sqlLite.Database('database.db');
		// this._db = new sqLite.Database(this._pathDb);
		// this._db = new sqlLite.Database(':memory:');
	}

	private _closeDb() {
		this._db.close();
	}
}