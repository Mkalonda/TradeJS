import Base from "../classes/Base";

const OANDAAdapter = require('../../../_npm_module_backup/oanda-adapter/index');

export default class BrokerApi extends Base {

    private _connected = false;
    private _client = null;

    constructor(private options: AccountSettings = <AccountSettings>{}) {
        super(options);
    }

    async init() {
        return this.connect();
    }

    async connect(): Promise<boolean> {
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

        return this.testConnection();
    }

    async testConnection(): Promise<boolean> {
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

    get isConnected() {
        return this._connected;
    }

    normalize(candles) {
        let i = 0, len = candles.length;

        for (; i < len; i++)
            candles[i].time /= 1000;

        return candles;
    }

    getAccounts(): Promise<any> {
        return new Promise((resolve, reject) => {
            this._client.getAccounts(function(err, accounts) {
                if (err)
                    return reject(err);

                resolve(accounts);
            });
        })
    }

    subscribeEventStream() {
        this._client.subscribeEvents(function (event) {
            console.log(event);
        }, this);
    }

    subscribePriceStream(instrument) {
        this._client.subscribePrice(this.options.accountId, instrument.toUpperCase(), tick => {
            this.emit('tick', tick);
        }, this);
    }

    unsubscribePriceStream(instrument) {

    }

    getInstruments() {
        return new Promise((resolve, reject) => {
            this._client.getInstruments(this.options.accountId, (err, instruments) => {
                if (err)
                    return reject(err);

                resolve(instruments);
            });
        });
    }

    getCandles(instrument, timeFrame, from, until): Promise<any> {

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

    updateSettings(settings) {
        this.kill();

        this.options = settings;

        this.connect()
    }

    kill(): void {
        this._client.kill();
        this._client = null;
    }
}