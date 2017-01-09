import * as _ from 'lodash';
import {Component, ViewChild, OnInit, ElementRef, Output, EventEmitter}  from '@angular/core';
import SocketService      from "../../services/socket.service";
import {InstrumentSettings} from "../../../../shared/interfaces/InstrumentSettings";
import {ChartsAnchorDirective} from "../../directives/chartsanchor.directive";
import {ChartComponent} from "../chart/chart.component";

declare var $: any;

@Component({
    selector: 'chart-overview',
    templateUrl: './chart-overview.component.html',
    styleUrls: ['./chart-overview.component.scss'],
    entryComponents: [ChartComponent]
})

export default class ChartOverviewComponent implements OnInit {

    @ViewChild(ChartsAnchorDirective) chartsAnchor: ChartsAnchorDirective;

    @Output() public focus = new EventEmitter();

    private _defaultCharts = [{instrument: 'EUR_USD'}, {instrument: 'AUD_CAD'}];
    private _mode: string = 'windowed';

    public focusedId: string = null;

    constructor(
        private socketService: SocketService,
        private _elementRef: ElementRef
    ) {}

    ngOnInit() {

        this.load();

        this.chartsAnchor.resize.subscribe(params => {

            switch (params.state) {
                case 'stretched':
                    this.setStretchedMode(params.id);
                    break;
                case 'windowed':
                    this.setWindowedMode();
                    break;
            }
        });

        this.chartsAnchor.focus.subscribe(params => this.setFocus(params.id));
    }

    add(instrumentSettings: InstrumentSettings) {
        let posArr = this.geRandomPosition(),
            chartRef;

        // Insert
        chartRef = this.chartsAnchor.add(instrumentSettings);

        // Set position
        chartRef.instance.setPosition(posArr[0], posArr[1]);

        // Set focus
        this.setFocus(chartRef.instance.options.id);
    }

    /*
     Get current instruments running in server
     */
    load() {

        this.socketService.socket.emit('instrument:chart-list', {}, (err, list: InstrumentSettings[]) => {

            if (err)
                return console.error(err);

            if (!list || !list.length)
                list = this._defaultCharts;

            list.forEach((instrumentSettings: InstrumentSettings) => this.add(instrumentSettings));
        });
    }

    /*
    Stretch the chart[id] to fit container,
    hides all other charts
     */
    setStretchedMode(id) {
        this._mode = 'stretched';

        let charts = this.chartsAnchor.charts,
            i = 0, len = charts.length,
            chart;

        for (; i < len; i++) {
            chart = charts[i].instance;
            if (chart.options.id !== id) {
                chart.$el.hide();
                continue;
            }

            chart.clearPosition();
            chart.setSize('100%', '100%', true);
        }
    }

    /*
    Set chart back to windowed mode,
    Shows all other charts also
     */
    setWindowedMode() {
        this._mode = 'windowed';

        let charts = this.chartsAnchor.charts,
            i = 0, len = charts.length;

        // First set new size of all
        for (; i < len; i++)
            charts[i].instance.setSize(null, null);

        // Then show all
        for (i = 0; i < len; i++)
            charts[i].instance.$el.show();
    }

    setFocus(id) {
        let chartRef = this.chartsAnchor.getChartById(id);

        if (!chartRef || chartRef.instance.focused)
            return;

        this.setAllBlurred();

        if (this._mode === 'stretched') {
            chartRef.instance.$el.siblings().hide();
            chartRef.instance.$el.show();
        }

        chartRef.instance.setFocused();

        this.focusedId = id;
    }

    setAllBlurred() {
        this.chartsAnchor.charts.forEach(chart => {
            chart.instance.setBlurred();
        });
    }

    tileWindows() {
        let height = this._elementRef.nativeElement.clientHeight,
            widht = this._elementRef.nativeElement.clientWidth,
            nrOfCharts = this.chartsAnchor.charts.length;
    }

    geRandomPosition() {
        let containerH = this._elementRef.nativeElement.clientHeight,
            containerW = this._elementRef.nativeElement.clientWidth,
            chartH = 400,
            chartW = 800;

        return [_.random(0, containerH-chartH), _.random(0, containerW-chartW)]
    }

    ngOnDestroy() {

    }
}