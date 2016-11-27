import Instrument from '../instrument/Instrument';

export default class EA extends Instrument {

    public tickCount:number = 0;

    protected listenForNewTick = false;

    async init() {
        await super.init();

        this._ipc.on('@run', opt => this.run(opt.from, opt.until));
        this._ipc.on('@report', (data, cb) => cb(null, this.report()));
    }

    run(from, until) {
        console.log('run! run! run! run! run! run!');

        return this
            .fetch(from, until)
            .then(() => this._ipc.send('main', '@run:end', undefined, false));
    }

    report() {
        return {
            tickCount: this.tickCount
        };
    }

    onTick() {
        super.onTick();
    }
}