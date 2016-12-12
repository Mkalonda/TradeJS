declare var $:any;

import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import LoginModel from "../common/login/login.model";
import LoginComponent from "../common/login/login.component";
import {CookieService} from 'angular2-cookie/core';
import SocketService from "./socket.service";
import ModalService from "./modal.service";

@Injectable()
export class UserService {

    private loggedIn = false;

    constructor(
        private http: Http,
        private _cookieService:CookieService,
        private _modalService: ModalService) {

        this.loggedIn = !!localStorage.getItem('auth_token');
    }

    login() {
        return new Promise((resolve, reject) => {

            let loginComponentRef = this._modalService.create(LoginComponent, {
                showCloseButton: false,
                buttons: [
                    {value: 'login', text: 'Login', type: 'primary'},
                    {text: 'Stay offline', type: 'default'}
                ],
                onClickButton(value) {
                    if (value === 'login') {

                        $.post('http://localhost:3000/login', loginComponentRef.instance.model, function(response, status) {
                            if (status === 'success') {
                                resolve({
                                    status: 'success'
                                });
                            } else {
                                alert('error!');
                                reject();
                            }
                        });

                        resolve(true);
                    } else
                        resolve(false)
                }
            });

        });



        // return new Promise((resolve, reject) => {
        //     $.post('http://localhost:3000/login', loginModel, function(response, status) {
        //         if (status === 'success') {
        //             resolve({
        //                 status: 'success'
        //             });
        //         } else {
        //             alert('error!');
        //             reject();
        //         }
        //     });
        // });
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