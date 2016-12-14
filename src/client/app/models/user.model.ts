
export class UserModel {
    id: number;
    username: string;
    password: string;
    broker:string = 'oanda';
    environment:string = 'practice';
    accountId:string;
    token:string;
    loggedIn: boolean = null;
}