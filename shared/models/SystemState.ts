import {ISystemState} from '../interfaces/SystemState';

export class SystemState implements ISystemState {

	public booting = false;
	public loggedIn = false;
	public state = null;
	public code = null;
	public message = '';
	public workers = 0;
	public cpu = 0;

	constructor(fields?: ISystemState) {
		if (fields) Object.assign(this, fields);
	}
}