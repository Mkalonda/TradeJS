import {Component, OnInit, OnDestroy, Output, EventEmitter} from '@angular/core';
import SocketService from "../../services/socket.service";
import {} from "../../../../../node_modules/@angular/core/src/metadata/directives";

@Component({
    selector: 'instrument-list',
    templateUrl: './instrument-list.component.html',
    styleUrls: ['./instrument-list.component.scss']
})


export default class InstrumentListComponent implements OnInit, OnDestroy {

    @Output() instrumentClicked = new EventEmitter();

    private instruments: Array<string>;
    private data: any = {};

    constructor(private socketService: SocketService,) {}

    ngOnInit() {
        this.onTick = this.onTick.bind(this);

        this.socketService.socket.on('tick', this.onTick.bind(this));

        this.socketService.socket.emit('instrument:list', {}, (err, instrumentList) => {
            this.instruments = instrumentList.map(instrument => instrument.instrument);
        });this.onTick = this.onTick.bind(this);
    }

    onTick(tick) {
        tick.direction = this.data[tick.instrument] && this.data[tick.instrument].bid > tick.bid ? 'down' : 'up';

        this.data[tick.instrument] = tick;
    }

    ngOnDestroy() {
        this.socketService.socket.off('tick', this.onTick);
    }
}