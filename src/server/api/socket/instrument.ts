import App from "../../_app";

module.exports = (app: App, socket) => {

    // Create
    socket.on('instrument:create', data => {
        app.controllers.instrument.create(data.instrument, data.timeFrame, data.start).catch(console.error);
    });

    // Destroy
    socket.on('instrument:destroy', (data, cb) => {
        app.controllers.instrument.destroy(data.id);
        cb(null);
            // .then(() => cb(null))
            // .catch(error => {
            //     console.log(error);
            //     cb('Could not destroy instrument');
            // });
    });

    // TODO: Move to cache API
    // Read bars
    socket.on('instrument:read', (data, cb) => {

        app.controllers.instrument
            .read(data.id, data.from, data.until, data.count, data.offset)
            .then(candles => cb(Array.from(candles)))
            .catch(console.error);
    });

    // Read data (indicators etc)
    socket.on('instrument:get-data', async (data, cb) => {
        try {
            cb(null, await app.controllers.instrument.getIndicatorData(data))
        } catch (err) {
            console.log(err);
            cb(err)
        }
    });

    socket.on('instrument:chart-list', (data, cb) => {
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

    socket.on('instrument:list', async (data, cb) => {
        try {
            cb(null, await app.controllers.cache.getInstrumentList())
        } catch (error) {
            console.log(error);
            cb(error);
        }
    });

    socket.on('instrument:indicator:options', async (data, cb) => {
        cb(null, await app.controllers.instrument.getIndicatorOptions(data))
    });

    socket.on('instrument:indicator:add', async (data, cb) => {
        cb(null, await app.controllers.instrument.addIndicator(data));
    });

    socket.on('instrument:indicator:remove', async (data, cb) => {

    });

};