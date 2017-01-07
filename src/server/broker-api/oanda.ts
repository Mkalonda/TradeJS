import Base from "../classes/Base";
import * as constants from '../../shared/constants/broker';

const OANDAAdapter = require('../../../_npm_module_backup/oanda-adapter/index');


export default class BrokerApi extends Base {

    private _settings: AccountSettings = <AccountSettings>{};
    private _client = null;
    private _connected = false;

    constructor() {
        super()
    }

    public get connected() {
        return this._connected
    }

    public async connect(accountSettings: AccountSettings): Promise<boolean> {
        console.log('accountSettings', accountSettings);
        if (this._client !== null)
            await this.kill();

        this._settings = accountSettings;

        this._client = new OANDAAdapter({
            // 'live', 'practice' or 'sandbox'
            environment: accountSettings.environment,
            // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
            accessToken: accountSettings.token,
            // Optional. Required only if environment is 'sandbox'
            username: accountSettings.username
        });

        this._client.on('error', err => {
            if (err.code === constants.BROKER_ERROR_UNAUTHORIZED) {
                this._connected = false;
                return;
            }

            console.log('Broker error: ', err);
            //this.emit('error', err);
        });

        this._connected = await this.testConnection();

        if (this._connected) {

            setTimeout(() => {
                this.emit('connected');
            }, 0);
        }

        return this._connected;
    }

    public async testConnection(): Promise<boolean> {
        // TODO: Stupid way to check, and should also check heartbeat
        try {
            await this.getAccounts();

            return true;
        } catch (error) {
            return false;
        }
    }

    private normalize(candles) {
        let i = 0, len = candles.length;

        for (; i < len; i++)
            candles[i].time /= 1000;

        return candles;
    }

    public getAccounts(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._client.getAccounts(function(err, accounts) {
                if (err)
                    return reject(err);

                resolve(accounts);
            });
        })
    }

    public subscribeEventStream() {
        this._client.subscribeEvents(function (event) {
            console.log(event);
        }, this);
    }

    public subscribePriceStream(instrument) {
        this._client.subscribePrice(this._settings.accountId, instrument.toUpperCase(), tick => {
            this.emit('tick', tick);
        }, this);
    }

    public unsubscribePriceStream(instrument) {

    }

    public getInstruments() {
        return new Promise((resolve, reject) => {
            this._client.getInstruments(this._settings.accountId, (err, instruments) => {
                if (err)
                    return reject(err);

                resolve(instruments);
            });
        });
    }

    public getCandles(instrument, timeFrame, from, until): Promise<any> {

        return new Promise((resolve, reject) => {

            if (typeof from != 'string')
                from = new Date(from).toISOString();

            if (typeof until != 'string')
                until = new Date(until).toISOString();

            this._client.getCandles(instrument, from, until, timeFrame, (err, candles) => {
                if (err)
                    return console.log(err) && reject(err);

                this.normalize(candles);
                //candles = fillGaps(timeFrame, from, until, candles);

                resolve(candles);
            });
        });
    }

    public async kill(): Promise<void> {
        this._connected = false;

        await this._client.kill();

        this._client = null;
    }
}