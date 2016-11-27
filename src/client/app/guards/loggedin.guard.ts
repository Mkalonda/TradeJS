import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {UserService} from '../services/user.service';

@Injectable()
export class LoggedInGuard implements CanActivate {

    constructor(private user: UserService, private router: Router) {

    }

    canActivate() {
        if (this.user.isLoggedIn())
            return true;

        this.router.navigate(['/login']);

        return false;
    }
}