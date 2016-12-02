import {Component, ViewChild} from '@angular/core';
import SocketService from "../../services/socket.service";
import LoginComponent from "../../pages/auth/login/login.component";

@Component({
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})

export default class HeaderComponent{

    @ViewChild(LoginComponent) login: LoginComponent;

    constructor(private socketService: SocketService) {

    }

    onClickLogin() {
        this.login.modal.open();
    }

    clearCache() {
        this.socketService.socket.emit('system:clear-cache', {}, (err:any) => {
            if (err)
                alert(err);

            alert('Cleaned cache');
        })
    }
}