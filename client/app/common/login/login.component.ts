import {Component, AfterViewInit} from '@angular/core';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export default class LoginComponent implements AfterViewInit {

    public isLoading = true;
    public options: any = {};

    constructor() {}

    ngAfterViewInit() {}

    onClickButton(value) {
        if (typeof this.options.onClickButton === 'function' && this.options.onClickButton(value) === false)
            return;

        // this.button.emit(value);
        // this.close.emit(value);
    }

    async onSubmit(event: Event) {
        event.preventDefault();

        this.isLoading = true;

        // let result = await this._userService.login();
        //
        // this.isLoading = false;
        //
        // console.log('LOGIN RESULT', result);
    }
}