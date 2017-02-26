import Instrument from '../instrument/Instrument';
import OrderManager from "../../modules/order/OrderManager";
import AccountManager from "../../modules/account/AccountManager";

export interface IEA {
    orderManager: OrderManager;
    onTick(timestamp, bid, ask): Promise<void>;
}

export default class EA extends Instrument implements IEA {

    public tickCount:number = 0;
    public live: boolean = false;

    public accountManager: AccountManager;
    public orderManager: OrderManager;

    protected from: number;
    protected until: number;

    async init() {
        await super.init();
        console.log(this.options);
        // TODO: Move to backtest class
        this.accountManager = new AccountManager({
            equality: this.options.equality
        });

        this.orderManager = new OrderManager(this.accountManager, {
            live: this.live
        });

        await this.accountManager.init();
        await this.orderManager.init();

        this._ipc.on('@run', opt => this.runBackTest(opt.from, opt.until));
        this._ipc.on('@report', (data, cb) => cb(null, this.report()));
    }

    async runBackTest(from: number, until: number): Promise<any> {

        this.from = from;
        this.until = until;

        while (true) {
            let result = await this._fetch(2000, false, from);
            console.log(result);
            if (result === 'end')
                break;
        }

        this._ipc.send('main', '@run:end', undefined, false);
    }

    report() {
        return {
            tickCount: this.tickCount,
            equality: this.accountManager.equality,
            orders: this.orderManager.closedOrders

        };
    }

    async onTick(timestamp, bid, ask): Promise<void> {
        await super.onTick(timestamp, bid, ask);

        if (this.live === false) {
            this.orderManager.tick()
        }
    }

    private _fetchAndExecuteTickBatch() {
        return this._fetch(2000)
    }
}