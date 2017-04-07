export interface ISystemState {
	booting: boolean;
	loggedIn: boolean;
	state: number;
	code: number;
	message?: string;
	workers: number;
	cpu: number
}