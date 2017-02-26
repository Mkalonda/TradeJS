
export class UserModel {
    id: number;
    username: string;
    password: string;
    broker: 'oanda';
    environment: 'practice';
    accountId: string;
    token: string;
    loggedIn: false
}