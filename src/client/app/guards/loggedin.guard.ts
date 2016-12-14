import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {UserService} from '../services/user.service';

@Injectable()
export class LoggedInGuard implements CanActivate {

    constructor(private userService: UserService, private router: Router) {

    }

    canActivate() {
        if (this.userService.loggedIn)
            return true;

        this.router.navigate(['/login']);

        return false;
    }
}