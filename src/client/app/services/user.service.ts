import {Injectable, OnInit} from '@angular/core';
import { Http, Headers } from '@angular/http';
import LoginModel from "../common/login/login.model";
import LoginComponent from "../common/login/login.component";
import {CookieService} from 'angular2-cookie/core';
import SocketService from "./socket.service";
import ModalService from "./modal.service";
import {UserModel} from "../models/user.model";

declare var $:any;

@Injectable()
export class UserService {

    public model: UserModel = new UserModel();

    constructor(
        private http: Http,
        private _cookieService:CookieService,
        private _modalService: ModalService,
        private _socketService: SocketService) {

        // TODO - HACK Make sure socket is initialized
        setTimeout(() => {
            this.init();
        }, 0);
    }

    get loggedIn() {
        return this.model.loggedIn
    }

    init() {
        this._socketService.socket.on('user-details', () => {

        });

        setInterval(() => {
            //console.log(this.model.loggedIn);
        }, 1500);
    }

    login() {
        let self = this;

        let loginComponentRef = this._modalService.create(LoginComponent, {
            showCloseButton: false,
            model: this.model,
            buttons: [
                {value: 'login', text: 'Login', type: 'primary'},
                {text: 'Stay offline', type: 'default'}
            ],
            onClickButton(value) {
                if (value === 'login') {

                    $.post('http://localhost:3000/login', this.model, (response, status) => {

                        if (status === 'success') {
                            this.model.loggedIn = true;

                            self._modalService.destroy(loginComponentRef);

                        } else {

                            alert('error! ' + status);
                        }
                    });
                }
            }
        });
    }

    logout() {
        return new Promise((resolve, reject) => {

            $.get('http://localhost:3000/logout', (response, status) => {
                if (status === 'success') {

                    this.model.loggedIn = false;

                    resolve({
                        status: 'success'
                    });
                } else {
                    alert('error!');
                    reject();
                }
            });
        });
    }

    storeSession(): Object | null {
        let data:any = null;

        try {
            let cookie = this._cookieService.get('account-settings');

            if (cookie)
                data = JSON.parse(cookie);

        } catch (err) {
            // TODO
        }

        return data;
    }

    deleteSessesion(): void {
        //this._cookieService.put('account-settings', JSON.stringify(this.model));
    }
}