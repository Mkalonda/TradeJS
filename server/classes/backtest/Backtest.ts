import {EventEmitter}   from 'events';
import * as moment      from 'moment';
import * as path        from 'path';

const colors = require('colors/safe');
const Table = require('cli-table');
const timeSpan = require('readable-timespan');

timeSpan.set({
	lessThanFirst: 'now',
	millisecond: 'ms',
	second: 's',
	minute: 'm',
	hour: 'h',
	day: 'd',
	week: 'w',
	month: 'mo',
	year: 'y',
	space: true,
	pluralize: false
});

export default class BackTest extends EventEmitter {

	instruments: any;
	timeFrame: string;
	from: number;
	until: number;

	startTime = null;
	endTime = null;
	startFetchingTime = null;
	endFetchingTime = null;
	report: any = {};

	EAs = [];

	constructor(protected app, protected opt) {
		super();

		this.instruments = this.opt.instruments;
		this.timeFrame = this.opt.timeFrame;
		this.from = this.opt.from;
		this.until = this.opt.until;
	}

	async run() {
		let EAPath = path.join(__dirname, '../../../_builds/ea/fluxy2/index');

		this.startTime = Date.now();

		// Prefetch data
		this.startFetchingTime = Date.now();
		await Promise.all(this.instruments.map(instrument => {
			return this.app.controllers.cache.fetch(instrument, this.timeFrame, this.from, this.until);
		}));
		this.endFetchingTime = Date.now();

		// Create instrument instances
		this.EAs = await Promise.all(this.instruments.map(instrument => {
			return this.app.controllers.instrument.create(instrument, this.timeFrame, false, EAPath, {
				equality: this.opt.equality
			});
		}));

		// Wait until all have finished
		await Promise.all(this.EAs.map(EA => {

			return new Promise((resolve, reject) => {

				EA.worker._ipc.on('@run:end', resolve);

				EA.worker.send('@run', {
					from: this.from,
					until: this.until
				}, false);
			});
		}));

		// Log finish time
		this.endTime = Date.now();

		this.report = await this.getReport();

		this._logReport(this.report);

		return this.report;
	}

	async getReport() {
		let totalTime = this.endTime - this.startTime,
			totalFetchTime = this.endFetchingTime - this.startFetchingTime,
			totalTestTime = 0,
			totalTicks = 0,
			totalTicksPerSecond = 0,
			ticksPerSecond,
			instrumentReports = await this.getInstrumentReports();

		instrumentReports.forEach(report => {
			totalTicks += report.ticks;
			totalTicksPerSecond += report.ticksPerSecond;
			totalTestTime += report.time.total
		});

		ticksPerSecond = Math.round(totalTicks / (totalTestTime / 1000));

		return {
			startEquality: this.opt.equality,
			diff: 0,
			timeFrame: this.timeFrame,
			from: this.from,
			fromPretty: moment.unix(this.from).format('MMM Do hh:mm:ss'),
			until: this.until || 0,
			untilPretty: moment.unix(this.until).format('MMM Do hh:mm:ss'),
			ticks: totalTicks,
			ticksPretty: totalTicks.toLocaleString(),
			ticksPerSecond: ticksPerSecond,
			ticksPerSecondPretty: ticksPerSecond.toLocaleString(),
			instruments: instrumentReports,
			nrOfTrades: 0,
			time: {
				fetching: totalFetchTime,
				fetchingPretty: timeSpan.parse(totalFetchTime),
				testing: totalTestTime,
				testingPretty: timeSpan.parse(totalTestTime),
				total: totalTime,
				totalPretty: timeSpan.parse(totalTime)
			}
		};
	}

	getInstrumentReports() {

		return Promise.all(this.EAs.map(async (EA) => {

			let report = await EA.worker.send('@report');

			let totalTime = (this.endTime - this.startTime) - (this.endFetchingTime - this.startFetchingTime),
				ticksPerSecond = Math.round(report.tickCount / (totalTime / 1000));

			return {
				id: EA.id,
				equality: report.equality.toFixed(4),
				diff: (report.equality - this.opt.equality).toFixed(4),
				orders: report.orders,
				nrOfTrades: report.orders.length,
				instrument: EA.instrument,
				timeFrame: this.timeFrame,
				from: this.from,
				fromPretty: new Date(this.from),
				until: this.until,
				untilPretty: new Date(this.until),
				ticks: report.tickCount,
				ticksPretty: report.tickCount.toLocaleString(),
				ticksPerSecond: ticksPerSecond,
				ticksPerSecondPretty: ticksPerSecond.toLocaleString(),
				time: {
					start: this.startTime,
					end: this.endTime,
					total: totalTime,
					totalPretty: timeSpan.parse(totalTime)
				}
			}
		}));
	}

	_logReport(report) {

		// instantiate
		let table = new Table({
			head: ['Name', 'Profit', 'Nr. Trades', 'Nr. Ticks'],
			// colWidths: [150, 150, 150, 150]
		});

		// table is an Array, so you can `push`, `unshift`, `splice` and friends
		table.push(...this.report.instruments.map(instrumentReport => [
			instrumentReport.instrument,
			instrumentReport.diff,
			instrumentReport.nrOfTrades,
			instrumentReport.ticksPretty
		]));

		console.info(`\n
            All instruments on time-frame ${colors.white(report.timeFrame)} finished Successfully.

${table.toString()}
            
            Time    : ${report.timePretty}
            Period  : ${report.fromPretty} until ${report.untilPretty}
            equality: ?

            ${colors.white(`
                Ticks    : ${report.ticksPretty}
                Ticks p/s: ${report.ticksPerSecondPretty}\n
            `)}
	`);
	}
}