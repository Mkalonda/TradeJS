import * as path    from 'path';
import WorkerHost   from '../classes/worker/WorkerHost';

const PATH_INSTRUMENT = path.join(__dirname, '../instrument/Instrument');


export default class InstrumentController {

    opt: Object;

    private _unique = 0;
    private _instruments = {};

    constructor(opt, protected app) {
        this.opt = opt;
    }

    async init() {}

    get instruments() {
        return this._instruments;
    }

    async create(instrument:string, timeFrame:string, filePath:string = PATH_INSTRUMENT) {

        instrument  = instrument.toUpperCase();
        timeFrame   = timeFrame.toUpperCase();

        let id = `${instrument}_${timeFrame}_${++this._unique}`;

        let worker = new WorkerHost({
            ipc: this.app._ipc,
            id: id,
            path: filePath,
            classArguments: {
                instrument: instrument,
                timeFrame: timeFrame
            }
        });

        await worker.init();

        this._instruments[id] = {
            id: id,
            instrument: instrument,
            timeFrame: timeFrame,
            up: true,
            worker: worker
        };

        return this._instruments[id];
    }

    read(id:string, from:number, until:number, count:number, bufferOnly?:boolean) {

        if (!this._instruments[id])
            return Promise.reject(`Reject: Instrument '${id}' does not exist`);

        return this
            .instruments[id]
            .worker
            .send('read', {
                from: from,
                until: until,
                bufferOnly: bufferOnly
            });
    }

    getData(params) {
        if (!this._instruments[params.id])
            return Promise.reject(`Reject: Instrument '${params.id}' does not exist`);

        return this.instruments[params.id].worker.send('get-data', {
                from: params.from,
                until: params.until,
                count: params.count
            });
    }

    addIndicator(params) {
        return this
            .instruments[params.id]
            .worker
            .send('indicator:add', {
                name: params.name,
                options: params.options
            });
    }

    removeIndicator() {

    }

    async destroy(id:string) {

        if (this._instruments[id]) {
            this._instruments[id].worker.kill();
            this._instruments[id] = null;
            delete this._instruments[id];

            this.app.debug('info', 'Destroy - Successfully destroyed ' + id);

        } else {
            this.app.debug('error', 'Destroy - Could not find instrument ' + id);
        }
    }
}