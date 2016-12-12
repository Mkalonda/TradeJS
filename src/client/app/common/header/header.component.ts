import {Component, ViewChild} from '@angular/core';
import SocketService from "../../services/socket.service";
import LoginComponent from "../../common/login/login.component";
import {UserService} from "../../services/user.service";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})

export default class HeaderComponent{

    @ViewChild(LoginComponent) login: LoginComponent;

    constructor(
        private socketService: SocketService,
        private _userService: UserService
    ) {}

    onClickLogin() {
        //this.login.modal.open();
        this._userService.login();
    }

    clearCache() {
        this.socketService.socket.emit('system:clear-cache', {}, (err:any) => {
            if (err)
                alert(err);

            alert('Cleaned cache');
        })
    }
}