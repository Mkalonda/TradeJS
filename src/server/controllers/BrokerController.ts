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
        let disconnected = false;

        try {
            await this._brokerApi.kill();
            disconnected = true;
        } catch (error) {
            console.log(error);
        } finally {
            await this.app.controllers.config.set({account: {}});
        }

        return disconnected;
    }

    async getInstrumentList(): Promise<any> {
        if (!this.isConnected)
            return Promise.reject([]);

        return this._brokerApi.getInstruments();
    }
}