import { Injectable } from '@angular/core';
import SocketService from './socket.service';
import {ConstantsService} from './constants.service';
import {SystemState} from '../../../shared/models/SystemState';
import {UserService} from './user.service';

@Injectable()
export default class SystemService {

    private _systemState = new SystemState();
    private _initialLoginShown = false;

    constructor(
        private _socketService: SocketService,
        private _constantsService: ConstantsService,
        private _userService: UserService) {}

    init() {

        this._socketService.socket.on('disconnect', () => {
            this._systemState.state = this._constantsService.constants.SYSTEM_STATE_ERROR;
            this._systemState.code = this._constantsService.constants.SYSTEM_STATE_CODE_NO_SERVER_CONNECTION;
            this._systemState.workers = 0;
        });

        this._socketService.socket.on('system:state', (systemState: SystemState) => {
            this._systemState = new SystemState(systemState);

            if (!this._initialLoginShown) {
                if (!this._systemState.booting && this._systemState.loggedIn === false) {
                    this._initialLoginShown = true;

                    // Dirty trick to let app load on the first time
                    // TODO: Should have never been here.....
                    setTimeout(() => {
                        this._userService.login();
                    }, 3000);
                }
            }
            console.log('system state update', systemState);
        });
    }

    get systemState() {
        return this._systemState;
    }
}