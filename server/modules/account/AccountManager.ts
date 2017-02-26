import Base from "../../classes/Base";

export default class AccountManager extends Base {

    private _equality: number = 10000;

    public get equality() {
        return this._equality;
    }

    public set equality(amount: number) {
        this._equality = amount;
    }

    constructor(options) {
        super(options);
    }

    async init() {
        this._equality = this.options.equality;
    }

    public addEquality(amount: number) {
        this._equality += amount;
        console.log('Equality: ', this._equality);
    }
}