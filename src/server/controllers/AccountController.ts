import Base from "../classes/Base";
import App from "../_app";

export default class AccountController extends Base {

    private _accounts: Array<AccountSettings> = [];
    private _details: any = {
        equality: 0
    };

    public get equality() {
        if (this._accounts)
            return this._details.equality;
    }

    constructor(options, protected app: App) {
        super(options);
    }

    public async init() {
        await this._load();
    }

    public async update() {

    }

    public getEquality() {

    }

    public getAccount() {

    }

    private async _load() {
        try {
            this._accounts = await this.app.controllers.broker.getAccounts();
        } catch (error) {

        }
    }
}