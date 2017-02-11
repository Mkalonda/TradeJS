import EA from '../../../dist/server/ea/EA';
import {IEA} from "tradejs/ea";

export default class MyEA extends EA implements IEA {

    count = 0;

    public async init(): Promise<any> {
        await super.init();

        this.addIndicator('MA', {
            color: 'blue'
        });
    }


    public async onTick(timestamp, bid, ask): Promise<void> {
        await super.onTick(timestamp, bid, ask);

        if (this.count++ < 5) {

            this.orderManager.add({
                instrument: this.instrument,
                count: 1,
                type: 'se',
                bid: bid,
                ask: ask
            });
        }

        if (this.count > 15) {
            if (this.orderManager.orders.length)
                this.orderManager.close(this.orderManager.orders[0].id, bid, ask);
        }
    }
}