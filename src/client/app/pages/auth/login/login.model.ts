export default class LoginModel {
    broker:string = 'oanda';
    password:string;
    environment:string = 'practice';
    accountId:string;
    token:string;
    username?:string;
}