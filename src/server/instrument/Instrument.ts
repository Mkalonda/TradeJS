import * as path        from 'path';
import InstrumentCache  from './InstrumentCache';
import Indicator        from "../../shared/indicators/Indicator";

const PATH_INDICATORS = path.join(__dirname, '../../../dist/shared/indicators');

export default class Instrument extends InstrumentCache {

    private _unique: number = 0;

    indicators = {};

    async init() {
        await super.init();
        await this._setIPCEvents();
    }

    onTick() {
        // Tick indicators
        for (let name in this.indicators) {
            this.indicators[name].onTick();
        }
    }

    addIndicator(name, options): any {
        let indicator = null;

        try {
            let id = name + '_' + ++this._unique;
            let indicatorPath = path.join(PATH_INDICATORS, name, 'index.js');
            let indicator: Indicator = new (require(indicatorPath).default)(this.ticks, options);
            this.indicators[id] = indicator;

            indicator._doCatchUp();
        } catch (err) {
            console.log('Could not add indicator', err);
        }

        return indicator;
    }

    getIndicatorData(id:string, count:number, shift?:number) {
        return this.indicators[id].getDrawBuffersData(count, shift);
    }

    getIndicatorsData(count:number, shift?:number) {
        let data = {};

        for (let id in this.indicators) {
            data[id] = this.getIndicatorData(id, count, shift);
        }

        return data;
    }

    async _setIPCEvents() {
        this._ipc.on('read', async (data, cb:Function) => {

            try {
                let candles = await this.get(data.from, data.until);

                cb(null, candles);
            } catch (error) {
                console.log('Error:', error);
                cb(error);
            }
        });

        this._ipc.on('get-data', async (data:any, cb:Function) => {
            try {
                cb(null, await this.getIndicatorsData(data.count, data.shift));
            } catch (error) {
                console.log('Error:', error);
                cb(error);
            }
        });

        this._ipc.on('indicator:add', async (data:any, cb:Function) => {
            try {
                this.addIndicator(data.name, data.options);
                cb(null, await this.getIndicatorsData(data.count, data.shift));
            } catch (error) {
                console.log('Error:', error);
                cb(error);
            }
        });
    }
}