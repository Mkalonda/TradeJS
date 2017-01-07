import BrokerApi from "../broker-api/oanda";

export default class BrokerController {

    private _brokerApi: BrokerApi = new BrokerApi();

    constructor(protected opt, protected app) {}

    async init() {
        await this._brokerApi.init();
    }

    get isConnected() {
        return this._brokerApi.connected
    }

    async connect(accountSettings): Promise<boolean> {
        let connected = false;

        try {

            this.app.controllers.config.set({account: accountSettings});

            connected = await this._brokerApi.connect(accountSettings);
        } catch (err) {
            console.error(err);
        }

        this.app.controllers.system.update({loggedIn: connected});

        return connected;
    }

    async disconnect(): Promise<boolean> {
        await this.app.controllers.config.set({account: {}});
        await this.app.controllers.system.update({loggedIn: false});

        try {
            await Promise.all([ this._brokerApi.kill(), this.app.controllers.cache.updateSettings({})])
            await this._brokerApi.kill();

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getInstrumentList(): Promise<any> {
        if (!this.isConnected)
            return Promise.reject([]);

        return this._brokerApi.getInstruments();
    }
}