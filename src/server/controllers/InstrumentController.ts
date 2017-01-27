import * as path    from 'path';
import WorkerHost   from '../classes/worker/WorkerHost';
import Base         from "../classes/Base";

const PATH_INSTRUMENT = path.join(__dirname, '../instrument/Instrument');


export default class InstrumentController extends Base {

    private _unique = 0;
    private _instruments = {};

    constructor(opt, protected app) {
        super(opt);
    }

    async init() {}

    get instruments() {
        return this._instruments;
    }

    async create(instrument:string, timeFrame:string, filePath:string = PATH_INSTRUMENT) {

        if (!instrument) {
            this.app.debug('error', 'InstrumentController:create - illegal instrument given');
            return Promise.reject('InstrumentController:create - illegal instrument given');
        }

        if (!timeFrame) {
            this.app.debug('error', 'InstrumentController:create - illegal timeFrame given');
            return Promise.reject('InstrumentController:create - illegal timeFrame given');
        }

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

        this.emit('created', this._instruments[id]);

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

    getIndicatorData(params) {
        if (!this._instruments[params.id])
            return Promise.reject(`Reject: Instrument '${params.id}' does not exist`);

        return this.instruments[params.id].worker.send('get-data', {
                name: params.name,
                from: params.from,
                until: params.until,
                count: params.count
            });
    }

    async getIndicatorOptions(params) {

        return new Promise((resolve, reject) => {

            const PATH_INDICATORS = path.join(__dirname, '../../shared/indicators');

            let configPath = `${PATH_INDICATORS}/${params.name}/config.json`;

            try {
                resolve(require(configPath));
            } catch(err) {
                reject(err);
            }
        });
    }

    async addIndicator(params) {
        let id, data;

        id = await this.instruments[params.id].worker.send('indicator:add', {
                name: params.name,
                options: params.options
            });

        if (params.readCount) {
            data = await this.getIndicatorData({
                id: params.id,
                name: params.name,
                count: params.readCount
            });
        }

        return {id, data};
    }

    async destroy(id:string) {

        if (this._instruments[id]) {
            this._instruments[id].worker.kill();
            this._instruments[id] = null;
            delete this._instruments[id];

            this.app.debug('info', 'Destroyed ' + id);

        } else {
            this.app.debug('error', 'Destroy - Could not find instrument ' + id);
        }
    }
}