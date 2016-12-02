declare var $:any;

import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import LoginModel from "../pages/auth/login/login.model";
import {CookieService} from 'angular2-cookie/core';
import SocketService from "./socket.service";

@Injectable()
export class UserService {
    private loggedIn = false;

    constructor(private http: Http, private _cookieService:CookieService, private socketService: SocketService) {
        this.loggedIn = !!localStorage.getItem('auth_token');
    }

    login(loginModel: LoginModel) {
        return new Promise((resolve, reject) => {
            $.post('http://localhost:3000/login', loginModel, function(response, status) {
                if (status === 'success') {
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

    logout() {
        localStorage.removeItem('auth_token');
        this.loggedIn = false;
    }

    isLoggedIn() {
        return this.loggedIn;
    }

    loadSession() {

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