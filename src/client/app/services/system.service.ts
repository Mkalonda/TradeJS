import { Injectable } from '@angular/core';
import LoginComponent from "../common/login/login.component";
import SocketService from "./socket.service";
import {ConstantsService} from "./constants.service";
import {SystemState} from "../../../shared/models/SystemState";

@Injectable()
export class SystemService {

    private _systemState = new SystemState();

    constructor(private socketService: SocketService, private constantsService: ConstantsService) {}

    init() {

        this.socketService.socket.on('disconnect', () => {
            this._systemState.state = this.constantsService.constants.SYSTEM_STATE_ERROR;
            this._systemState.code = this.constantsService.constants.SYSTEM_STATE_CODE_NO_SERVER_CONNECTION;
            this._systemState.workers = 0;
        });

        this.socketService.socket.on('system:state', (systemState:SystemState) => {
            this._systemState = new SystemState(systemState);

            console.log('system state update', systemState);
        });
    }

    get systemState() {
        return this._systemState
    }
}