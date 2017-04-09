import App from '../../_app';

module.exports = (app: App, socket) => {

	// Create
	socket.on('instrument:create', options => {
		app.controllers.instrument.create(options.instrument, options.timeFrame, options.live, options.start).catch(console.error);
	});

	// Destroy
	socket.on('instrument:destroy', (options, cb) => {
		app.controllers.instrument.destroy(options.id);
		cb(null);
	});

	// TODO: Move to cache API
	// Read bars
	socket.on('instrument:read', (options, cb) => {

		app.controllers.instrument
			.read(options.id, options.from, options.until, options.count, undefined, options.indicators)
			.then(data => cb(null, data))
			.catch(console.error);
	});

	// Read options (indicators etc)
	socket.on('instrument:get-options', async (options, cb) => {
		try {
			cb(null, await app.controllers.instrument.getIndicatorData(options));
		} catch (err) {
			console.log(err);
			cb(err);
		}
	});

	socket.on('instrument:chart-list', (options, cb) => {
		let instruments = app.controllers.instrument.instruments,
			list = [],
			instrument, key;

		for (key in instruments) {
			instrument = instruments[key];

			list.push({
				id: instrument.id,
				timeFrame: instrument.timeFrame,
				instrument: instrument.instrument
			});
		}

		cb(null, list);
	});

	socket.on('instrument:list', async (options, cb) => {
		try {
			cb(null, await app.controllers.cache.getInstrumentList());
		} catch (error) {
			console.log(error);
			cb(error);
		}
	});

	socket.on('instrument:toggleTimeFrame', async (options, cb) => {
		try {
			cb(null, await app.controllers.instrument.toggleTimeFrame(options.id, options.timeFrame));
		} catch (error) {
			console.log(error);
			cb(error);
		}
	});

	socket.on('instrument:indicator:options', async (options, cb) => {
		cb(null, await app.controllers.instrument.getIndicatorOptions(options));
	});

	socket.on('instrument:indicator:add', async (options, cb) => {
		cb(null, await app.controllers.instrument.addIndicator(options));
	});

	socket.on('instrument:indicator:remove', async (options, cb) => {

	});
};