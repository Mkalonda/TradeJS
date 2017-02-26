import * as path    from 'path';
import Base         from '../classes/Base';

const debug = require('debug')('TradeJS:BrokerController');

export default class BrokerController extends Base {

    private _ready = false;
    private _brokerApi: any;

    constructor(protected opt, protected app) {
        super(opt);
    }

    public async init(): Promise<void> {
        await this.loadBrokerApi('oanda');
    }

    public async loadBrokerApi(apiName: string): Promise<void> {
        await this.disconnect();

        try {

            // Clean up node cached version
            let filePath = path.join(__dirname, '..', 'classes', 'broker-api', apiName, apiName);
            delete require.cache[path.resolve(filePath)];

            // Load the new BrokerApi
            let BrokerApi = require(filePath).default;
            this._brokerApi = new BrokerApi(this.app.controllers.config.get().account);
            await this._brokerApi.init();

            this._ready = true;

            this.emit('ready-state', {state: true});

        } catch (error) {
            this._ready = false;
            this.emit('ready-state', {state: false});
            console.log('Error creating broker API \n\n', error);
        }
    }

    public getAccounts(): Promise<Array<any>> {
        if (this._ready)
            return this._brokerApi.getAccounts();
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

    async disconnect(): Promise<void> {
        this._ready = false;

        await this.app.controllers.system.update({loggedIn: false});

        if (this._brokerApi) {
            try {
                await Promise.all([this._brokerApi.destroy(), this.app.controllers.cache.updateSettings({})]);
                await this._brokerApi.destroy();
                this._brokerApi = null;
            } catch (error) {
                console.log(error);
            }
        }

        debug('Disconnected');

        this.emit('disconnected');
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