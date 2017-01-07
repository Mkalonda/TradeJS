import {Component, ViewChild, OnInit}  from '@angular/core';
import SocketService      from "../../services/socket.service";
import {InstrumentSettings} from "../../../../shared/interfaces/InstrumentSettings";
import {ChartsAnchorDirective} from "../../directives/chartsanchor.directive";
import {ChartComponent} from "../chart/chart.component";

@Component({
    selector: 'chart-overview',
    templateUrl: './chart-overview.component.html',
    styleUrls: ['./chart-overview.component.css'],
    entryComponents: [ChartComponent]
})

export default class ChartOverviewComponent implements OnInit {
    @ViewChild(ChartsAnchorDirective) chartsAnchor: ChartsAnchorDirective;

    private _defaultCharts = [{instrument: 'EUR_USD'}, {instrument: 'AUD_CAD'}];

    constructor(private socketService: SocketService) {}

    ngOnInit() {
        this.load();
    }

    add(instrumentSettings: InstrumentSettings) {
        this.chartsAnchor.add(instrumentSettings);
    }

    load() {

        this.socketService.socket.emit('instrument:chart-list', {}, (err, list: InstrumentSettings[]) => {

            if (err)
                return console.error(err);

            if (!list || !list.length)
                list = this._defaultCharts;

            list.forEach((instrumentSettings: InstrumentSettings) => this.add(instrumentSettings));
        });
    }
}