import {ConstantsService} from "./services/constants.service";
declare let $: any;

import {Component, ViewEncapsulation, AfterViewInit, ElementRef} from '@angular/core';
import {Http, Response} from '@angular/http';

import {Observable} from 'rxjs';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import SocketService    from "./services/socket.service";
import {SystemService}  from "./services/system.service";
import {UserService}    from "./services/user.service";

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.css'],
    //encapsulation: ViewEncapsulation.Native
})

export class AppComponent implements AfterViewInit {
    observable$: Observable<{}>;

    socket: any;

    constructor(private element: ElementRef,
                private user: UserService,
                private constantsService: ConstantsService,
                private socketService: SocketService,
                private systemService: SystemService) {
        constantsService.init();
        socketService.init();
        systemService.init();
    }

    ngAfterViewInit() {
        let startTime = (<any>window).tradeJsStartTime,
            minDiff = 1500,
            diff = Date.now() - startTime;

        document.body.className = 'animate';

        window.setTimeout(() => {
            this.element.nativeElement.previousElementSibling.style.opacity = 0;
            this.element.nativeElement.style.opacity = 1;
        }, minDiff);
    }
}
