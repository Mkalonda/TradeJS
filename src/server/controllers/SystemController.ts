import * as SYSTEM from "../../shared/constants/system";
import {SystemState} from "../../shared/interfaces/SystemState";

const merge = require('deepmerge');

export default class SystemController {

    _state: SystemState;

    constructor(protected opt, protected app) {}

    init() {
        return Promise.resolve();
    }

    clearCache() {
        return this.app.controllers.cache.reset(null, null, null, null);
    }

    loginBroker(settings) {
        this.app.controllers.config.set({account: settings});
        this.app.controllers.cache.updateSettings(settings);
    }

    updateState(changes): SystemState {
        return Object.assign(this.state, changes);
    }

    get state(): SystemState {
        if (this.app.controllers.broker.isConnected === false) {
            return {
                state: SYSTEM.SYSTEM_STATE_ERROR,
                code: SYSTEM.SYSTEM_STATE_CODE_LOGIN,
                message: '',
                workers: this.getTotalWorkers(),
                cpu: require('os').cpus().length
            }
        }

        return {
            state: SYSTEM.SYSTEM_STATE_OK,
            code: SYSTEM.SYSTEM_STATE_CODE_OK,
            message: '',
            workers: this.getTotalWorkers(),
            cpu: require('os').cpus().length
        }
    }

    getTotalWorkers(): number {
        // Instruments
        let count = Object.keys(this.app.controllers.instrument.instruments).length;

        // Cache
        // TODO: Check if cache is really running
        count+= 1;

        return count;
    }
}