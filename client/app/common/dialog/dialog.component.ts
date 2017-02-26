import {Component, EventEmitter, Input, OnInit} from '@angular/core';

@Component({
    selector: 'dlg',
    templateUrl: './dialog.component.html',
    styleUrls: ['./dialog.component.scss']
})

export class DialogComponent implements OnInit {
    @Input() options = <any>{};

    model: any = {};

    close = new EventEmitter();
    button = new EventEmitter();

    onClickButton(value) {
        if (typeof this.options.onClickButton === 'function' && this.options.onClickButton(value) === false)
            return;

        this.button.emit(value);
        this.close.emit(value);
    }

    onClickedExit() {
        this.close.emit('event');
    }

    ngOnInit() {

    }
}