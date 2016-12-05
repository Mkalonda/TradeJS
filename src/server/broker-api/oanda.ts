import Base from "../classes/Base";
import * as constants from '../../shared/constants/broker';

const OANDAAdapter = require('../../../_npm_module_backup/oanda-adapter/index');


export default class BrokerApi extends Base {

    private _client = null;
    private _connected = false;

    constructor(protected options: AccountSettings = <AccountSettings>{}) {
        super(options);
    }

    public async init(): Promise<any> {
        super.init();

        return this.connect();
    }

    public get connected() {
        return this._connected;
    }

    public async connect(): Promise<boolean> {
        if (this._client !== null)
            throw new Error('Broker Api is already connected!');

        this._client = new OANDAAdapter({
            // 'live', 'practice' or 'sandbox'
            environment: this.options.environment,
            // Generate your API access in the 'Manage API Access' section of 'My Account' on OANDA's website
            accessToken: this.options.token,
            // Optional. Required only if environment is 'sandbox'
            username: this.options.username
        });

        this._client.on('error', err => {
            if (err.code === constants.BROKER_ERROR_UNAUTHORIZED) {
                this._connected = false;

                return;
            }

            console.log('Broker error: ', err);

            this._connected = false;

            this.emit('disconnect', err);
            //this.emit('error', err);
        });

        await this.testConnection();

        this.emit('connected');

        return true;
    }

    public async testConnection(): Promise<boolean> {
        // TODO: Also check heartbeat
        try {
            await this.getAccounts();
            this._connected = true;

            return true;
        } catch (error) {
            console.log(error);
            this._connected = false;

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
        this._client.subscribePrice(this.options.accountId, instrument.toUpperCase(), tick => {
            this.emit('tick', tick);
        }, this);
    }

    public unsubscribePriceStream(instrument) {

    }

    public getInstruments() {
        return new Promise((resolve, reject) => {
            this._client.getInstruments(this.options.accountId, (err, instruments) => {
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

    public async updateSettings(settings) {
        await this.kill();

        this.updateOptions(settings);

        return this.connect()
    }

    public async kill(): Promise<void> {
        this._connected = false;

        await this._client.kill();

        this._client = null;
    }
}