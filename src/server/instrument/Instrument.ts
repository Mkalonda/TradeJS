import * as path       from 'path';
import InstrumentCache from './InstrumentCache';

const PATH_INDICATORS = path.join(__dirname, '../../../dist/shared/indicators/');

export default class Instrument extends InstrumentCache {

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

    setIndicator(name, ...params)  {
        let indicatorPath = path.join(PATH_INDICATORS, name + '.js');
        let indicator = new (require(indicatorPath).default)(this.ticks, ...params);
        this.indicators[name] = indicator;

        indicator._doCatchUp();

        return indicator;
    }

    getIndicatorData(name:string, count:number, shift?:number) {
        return this.indicators[name].getDrawBuffersData(count, shift);
    }

    getIndicatorsData(count:number, shift?:number) {
        let data = {};

        for (let name in this.indicators) {
            data[name] = this.getIndicatorData(name, count, shift);
        }

        return data;
    }

    async _setIPCEvents() {
        this._ipc.on('read', async (data, cb:Function) => {

            try {
                cb(null, await this.get(data.from, data.until));
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
                this.setIndicator(data.name, data.options);
                cb(null, await this.getIndicatorsData(data.count, data.shift));
            } catch (error) {
                console.log('Error:', error);
                cb(error);
            }
        });
    }
}