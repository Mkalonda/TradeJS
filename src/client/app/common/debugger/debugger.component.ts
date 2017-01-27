declare var $:any;

import SocketService from "../../services/socket.service";
import {Component, AfterViewInit, ElementRef} from '@angular/core';
import 'jquery-resizable-dom';

@Component({
    selector: 'debugger',
    templateUrl: './debugger.component.html',
    styleUrls: ['./debugger.component.scss']
})

export default class DebuggerComponent implements AfterViewInit {

    private _messages: Array<{
        type: string,
        text: string,
        data?: any
    }> = [];

    constructor(
        private socketService: SocketService,
        private elementRef: ElementRef
    ) {}

    ngAfterViewInit() {
        this._setDragger();

        this.socketService.socket.on('debug', data => {
            this._messages.push(data);
        });
    }

    _setDragger() {
        $(this.elementRef.nativeElement).resizable({
            handleSelector: ".splitter",
            resizeWidth: false,
            resizeHeightFrom: 'top',
            onDrag: function (e, $el, newWidth, newHeight) {
                e.preventDefault();

                if (newHeight > 400)
                    newHeight = 400;
                if (newHeight < 18)
                    newHeight = 18;

                $el[0].style.height = newHeight + 'px';

                return false;
            }
        });
    }
}