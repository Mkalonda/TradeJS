import {Component}  from '@angular/core';
import {SystemService}      from '../../../services/system.service';
import {ConstantsService}   from '../../../services/constants.service';
import {UserService} from '../../../services/user.service';

@Component({
	selector: 'status',
	templateUrl: './status.component.html',
	styleUrls: ['./status.component.scss']
})

export class StatusComponent {

	protected constants;

	constructor(public systemService: SystemService,
				public userService: UserService,
				public constantsService: ConstantsService) {
	}

	onClickLogin() {
		this.userService.login();
	}
}