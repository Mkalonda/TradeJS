import {Component, ViewChild} from '@angular/core';
import InstrumentListComponent from "../../common/intrument-list/instrument-list.component";
import ChartOverviewComponent from "../../common/chart-overview/chart-overview.component";

@Component({
    selector: 'page-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css', '../../common/css/three-column.css']
})

export class HomeComponent {

    @ViewChild(InstrumentListComponent) instrumentList: InstrumentListComponent;
    @ViewChild(ChartOverviewComponent) chartOverview: ChartOverviewComponent;

    constructor() {

    }
}