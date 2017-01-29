import {Component, ViewChild} from '@angular/core';
import SocketService from "../../services/socket.service";
import LoginComponent from "../../common/login/login.component";
import {UserService} from "../../services/user.service";
import {SystemService} from "../../services/system.service";

declare var window: any;

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})

export default class HeaderComponent{

    @ViewChild(LoginComponent) login: LoginComponent;

    constructor(
        protected socketService: SocketService,
        protected userService: UserService,
        protected systemService: SystemService,
    ) {}

    openEditor() {
        let url = `${location.href.split('#')[0]}#/editor`,
            win;

        // Electron
        if (window.electron) {
            win = window.electron.openWindow(url);
        }
        else {
            win = window.open(url, 'editor');
        }
    }

    onClickLogin() {
        this.userService.login();
    }

    clearCache() {
        this.socketService.socket.emit('system:clear-cache', {}, (err:any) => {
            if (err)
                alert(err);

            alert('Cleaned cache');
        })
    }
}