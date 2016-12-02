import * as _               from 'lodash';
import {Component, OnInit}  from '@angular/core';
import SocketService      from "../../services/socket.service";
import {InstrumentSettings} from "../../../../shared/interfaces/InstrumentSettings";
import ChartOverviewService from "../../services/chart-overview.service";

@Component({
    selector: 'chart-overview',
    templateUrl: './chart-overview.component.html',
    styleUrls: ['./chart-overview.component.css']
})

export default class ChartOverviewComponent {

    public charts: InstrumentSettings[];

    private _defaultInstrumentSettings: InstrumentSettings = {
        instrument: null,
        timeFrame: 'M15'
    };

    protected socket: any;
    protected instruments = [];

    constructor(private socketService: SocketService, protected chartOverviewService: ChartOverviewService) {
        this.socket = socketService.socket;
        this.charts = chartOverviewService.charts;
    }

    onCloseChart() {}
}