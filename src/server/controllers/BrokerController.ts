import BrokerApi from "../broker-api/oanda";

export default class BrokerController {

    private _brokerApi: BrokerApi = new BrokerApi(this.app.controllers.config.get().account);

    constructor(protected opt, protected app) {}

    async init() {
        await this._brokerApi.init();
    }

    get isConnected() {
        return this._brokerApi.connected
    }

    getInstrumentList() {
        return this._brokerApi.getInstruments();
    }
}