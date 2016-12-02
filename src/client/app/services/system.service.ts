import {SystemState} from "../../../shared/interfaces/SystemState";

import { Injectable } from '@angular/core';
import LoginModel from "../pages/auth/login/login.model";
import SocketService from "./socket.service";
import {ConstantsService} from "./constants.service";

@Injectable()
export class SystemService {

    private _systemState: SystemState = <SystemState>{};

    constructor(private socketService: SocketService, private constantsService: ConstantsService) {}

    init() {

        this.socketService.socket.on('disconnect', () => {
            this._systemState = <SystemState>{
                state: this.constantsService.constants.SYSTEM_STATE_ERROR,
                code: this.constantsService.constants.SYSTEM_STATE_CODE_NO_SERVER_CONNECTION,
                workers: 0
            };
        });

        this.socketService.socket.on('system:state', (systemState:SystemState) => {
            this._systemState = systemState;
            console.log('system state update', systemState);
        });
    }

    get systemState() {
        return this._systemState
    }
}