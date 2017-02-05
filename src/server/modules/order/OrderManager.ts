import * as _   from 'lodash';
import Base     from "../../classes/Base";

export default class OrderManager extends Base {

    private _orders = [];
    private _fake: boolean = true;
    private _unique: number = 0;

    constructor(opt) {
        super(opt)
    }

    public async init() {

    }

    add(count: number, type: number, instrument: string, bid: number, ask: number) {
        let uniqueId = this._unique++;

        this._orders.push({
            count: count,
            instrument: instrument,
            bid: bid,
            ask: ask,
            id: uniqueId
        });

        return uniqueId;
    }

    remove(id: number) {
        let order = _.find(this._orders, {id});
    }

    update() {

    }
}