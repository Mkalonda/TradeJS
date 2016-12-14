import * as SYSTEM from "../../shared/constants/system";
import {SystemState} from "../../shared/interfaces/SystemState";

const merge = require('deepmerge');
const cpus = require('os').cpus().length;

export default class SystemController {

    constructor(protected opt, protected app) {}

    init() {
        return Promise.resolve();
    }

    clearCache() {
        return this.app.controllers.cache.reset(null, null, null, null);
    }

    async loginBroker(settings) {
        this.app.controllers.config.set({account: settings});

        await this.app.controllers.cache.updateSettings(settings);


    }

    updateState(changes): SystemState {
        return Object.assign(this.state, changes);
    }

    get state(): SystemState {
        let state = {
            workers: this.getTotalWorkers(),
            cpu: cpus
        };

        if (this.app.controllers.broker.isConnected === false) {

            Object.assign(state, {
                state: SYSTEM.SYSTEM_STATE_ERROR,
                code: SYSTEM.SYSTEM_STATE_CODE_LOGIN
            });

        } else {

            Object.assign(state, {
                state: SYSTEM.SYSTEM_STATE_OK,
                code: SYSTEM.SYSTEM_STATE_CODE_OK,
            })
        }

        return <SystemState>state;
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