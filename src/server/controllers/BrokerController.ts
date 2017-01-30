import BrokerApi from "../broker-api/oanda";
import Base from "../classes/Base";

const debug = require('debug')('TradeJS:BrokerController');

export default class BrokerController extends Base {

    private _brokerApi: BrokerApi;

    constructor(protected opt, protected app) {
        super(opt);
    }

    async init() {
        this._brokerApi = new BrokerApi(this.app.controllers.config.get().account);
        await this._brokerApi.init();
    }


    // async connect(accountSettings): Promise<boolean> {
    //     if (this.isConnected)
    //         return true;
    //
    //     debug('Connecting');
    //
    //     let connected = false;
    //
    //     try {
    //         this.app.controllers.config.set({account: accountSettings});
    //
    //         connected = await this._brokerApi.connect(accountSettings);
    //     } catch (err) {
    //         console.error(err);
    //     }
    //
    //     if (connected) {
    //         debug('Connected');
    //         this.emit('connected');
    //     }
    //
    //     this.app.controllers.system.update({loggedIn: connected});
    //
    //     return connected;
    // }

    async disconnect(): Promise<boolean> {
        debug('Disconnecting');

        this.emit('disconnected');

        await this.app.controllers.config.set({account: {}});
        await this.app.controllers.system.update({loggedIn: false});

        try {
            await Promise.all([ this._brokerApi.destroy(), this.app.controllers.cache.updateSettings({})])
            await this._brokerApi.destroy();

            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getInstrumentList(): Promise<any> | null {
        debug('Loading instrument list');

        try {
            return await this._brokerApi.getInstruments();
        } catch (error) {
            return null;
        }
    }
}