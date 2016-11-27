module.exports = (app, socket) => {

    let instrumentController = app.controllers.instrument;

    // Create
    socket.on('instrument:create', (data, cb) => {

        instrumentController
            .create(data.instrument, data.timeFrame, data.start)
            .then(instrument => cb(null, {
                id: instrument.id
            }))
            .catch(error => {
                console.log(error);
                cb('Could not create instrument');
            });
    });

    // Destroy
    socket.on('instrument:destroy', (data, cb) => {

        instrumentController
            .destroy(data.id)
            .then(() => cb(null))
            .catch(error => {
                console.log(error);
                cb('Could not destroy instrument');
            });
    });

    // TODO: Move to cache API
    // Read bars
    socket.on('instrument:read', (data, cb) => {

        instrumentController
            .read(data.id, data.from, data.until, data.count, data.offset)
            .then(candles => cb(Array.from(candles)))
            .catch(console.error);
    });

    // Read data (indicators etc)
    socket.on('instrument:get-data', async (data, cb) => {
        try {
            cb(null, await instrumentController.getData(data))
        } catch (err) {
            console.log(err);
            cb(err)
        }
    });

    // Update
    socket.on('instrument:update', data => {
        instrumentController.update(data)
    });

    // Delete
    socket.on('instrument:delete', data => {
        instrumentController.remove(data.id)
    });

    socket.on('instrument:chart-list', (data, cb) => {

        let list = [],
            instrument, key;

        for (key in instrumentController.instruments) {
            instrument = instrumentController.instruments[key];

            list.push({
                id: instrument.id,
                timeFrame: instrument.timeFrame,
                instrument: instrument.instrument
            });
        }
        cb(null, list);
    });

    socket.on('instrument:list', async (data, cb) => {
        cb(null, await app.controllers.broker.getInstrumentList());
    });

    socket.on('instrument:indicator:add', async (data, cb) => {
        cb(null, await app.controllers.instrument.addIndicator(data));
    });

    socket.on('instrument:indicator:remove', async (data, cb) => {
        cb(null, await app.controllers.broker.getInstrumentList(data));
    });

};