import * as os      from 'os';
import * as SYSTEM from '../../shared/constants/system';
import Base from '../classes/Base';
import {SystemState} from '../../shared/models/SystemState';

export default class SystemController extends Base {

    private _state = new SystemState({
        booting: true,
        loggedIn: false,
        state: SYSTEM.SYSTEM_STATE_BOOTING,
        code: SYSTEM.SYSTEM_STATE_CODE_OK,
        cpu: os.cpus().length,
        workers: 1
    });

    constructor(protected opt, protected app) {
        super(opt);
    }

    async init() {}

    clearCache() {
        return this.app.controllers.cache.reset(null, null, null, null);
    }

    update(changes): SystemState {
        // Merge state options
        Object.assign(this._state, changes);

        // Set 'definite' state (okay, warning, error)
        this._state.state = this.getSimpleState();

        this.emit('change', this._state);

        return this._state;
    }

    get state(): SystemState {
        return this._state;
    }

    getTotalWorkers(): number {
        // Instruments
        let count = Object.keys(this.app.controllers.instrument.instruments).length;

        // Self
        // TODO: Check if cache is really running
        count += 1;

        // Cache
        // TODO: Check if cache is really running
        count += 1;

        return count;
    }

    getSimpleState(): number {
        if (!this.state.booting && this._state.loggedIn)
            return SYSTEM.SYSTEM_STATE_OK;

        return SYSTEM.SYSTEM_STATE_ERROR;
    }
}