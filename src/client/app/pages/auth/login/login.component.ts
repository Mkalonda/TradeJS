import {Component, AfterViewInit} from '@angular/core';
import {ViewChild} from "../../../../../../node_modules/@angular/core/src/metadata/di";
import {ModalComponent} from "../../../../../../node_modules/ng2-bs3-modal/components/modal";
import {UserService} from "../../../services/user.service";
import LoginModel from "./login.model";

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})

export default class LoginComponent implements AfterViewInit {
    @ViewChild('loginModal') modal: ModalComponent;

    public isLoading: boolean = true;

    model = new LoginModel();

    constructor(private user: UserService) {}

    ngAfterViewInit() {}

    async onSubmit(event: Event) {
        event.preventDefault();

        this.isLoading = true;

        let result = await this.user.login(this.model);

        this.isLoading = false;

        console.log('LOGIN RESULT', result);
    }
}