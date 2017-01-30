import * as path    from 'path';
import * as _       from 'lodash';
import WorkerHost   from '../classes/worker/WorkerHost';
import Base         from "../classes/Base";
import App from "../_app";

const PATH_INSTRUMENT = path.join(__dirname, '../instrument/Instrument');

const debug = require('debug')('TradeJS:InstrumentController');

export default class InstrumentController extends Base {

    public ready = false;

    private _unique = 0;
    private _instruments = {};
    private _instrumentList: Array<string> = [];

    constructor(opt, protected app: App) {
        super(opt);
    }

    async init() {}

    public get instruments() {
        return this._instruments;
    }

    public async create(instrument:string, timeFrame:string, filePath:string = PATH_INSTRUMENT) {
        debug(`Creating instrument ${instrument}`);

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
            ipc: this.app.ipc,
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

    public read(id:string, from:number, until:number, count:number, bufferOnly?:boolean) {
        debug(`Reading instrument ${id}`);

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

    public getIndicatorData(params) {
        if (!this._instruments[params.id])
            return Promise.reject(`Reject: Instrument '${params.id}' does not exist`);

        return this.instruments[params.id].worker.send('get-data', {
                name: params.name,
                from: params.from,
                until: params.until,
                count: params.count
            });
    }

    public async getIndicatorOptions(params) {

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


    public async addIndicator(params) {
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

    public destroy(id:string): void {

        if (this._instruments[id]) {
            this._instruments[id].worker.kill();
            this._instruments[id] = null;
            delete this._instruments[id];

            this.app.debug('info', 'Destroyed ' + id);
        } else {
            this.app.debug('error', 'Destroy - Could not find instrument ' + id);
        }

    }

    public async destroyAll(): Promise<any> {
        return Promise.all(_.map(this._instruments, (instrument, id) => this.destroy(id)));
    }

    // public isReady() {
    //     if (
    //         this._instrumentList.length &&
    //     )
    // }
}