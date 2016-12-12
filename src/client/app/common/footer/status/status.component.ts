import {Component}  from '@angular/core';
import {SystemService}      from "../../../services/system.service";
import {ConstantsService}   from "../../../services/constants.service";
import {UserService} from "../../../services/user.service";

@Component({
    selector: 'status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss']
})

export default class StatusComponent {

    protected constants;

    constructor(
        protected systemService: SystemService,
        protected userService: UserService,
        protected constantsService: ConstantsService
    ) {}

    onClickLogin() {
        this.userService.login();
    }
}