import * as _ from 'lodash';
import {
    Component, ViewChild, OnInit, ElementRef, Output, EventEmitter, ViewContainerRef,
    ComponentFactoryResolver, ComponentRef, QueryList, ViewChildren
}  from '@angular/core';
import SocketService      from "../../services/socket.service";
import {InstrumentSettings} from "../../../../shared/interfaces/InstrumentSettings";
import InstrumentsService from "../../services/instruments.service";
import {ChartBoxComponent} from "../chart-box/chart-box.component";
import {InstrumentModel} from "../../models/instrument.model";

@Component({
    selector: 'chart-overview',
    templateUrl: './chart-overview.component.html',
    styleUrls: ['./chart-overview.component.scss'],
    entryComponents: [ChartBoxComponent]
})

export default class ChartOverviewComponent implements OnInit {

    @ViewChildren(ChartBoxComponent) charts: QueryList<ChartBoxComponent>;

    @Output() public closed = new EventEmitter();

    private _focusedModel: InstrumentModel;

    constructor(protected _instrumentsService: InstrumentsService,
                private _elementRef: ElementRef,
                private _socketService: SocketService) {
    }

    ngOnInit() {
        this._instrumentsService.instruments$.subscribe(instruments => {
            this.setFocusToHighestIndex();
        });

    }

    tileWindows() {
        let containerH = this._elementRef.nativeElement.clientHeight,
            containerW = this._elementRef.nativeElement.clientWidth,
            len = this.charts.length;

        this.charts.forEach((chart, i) => {
            chart.mode = 'windowed';

            chart.$el.removeAttr('style').addClass('animate');

            setTimeout(() => {
                chart.$el.removeClass('animate');
            }, 400);

            if (len < 4) {
                let chartW = Math.floor(containerW / len);
                chart.setSize(chartW, containerH - 2);
                chart.setPosition(0, (i * chartW) + (i * 1));
                return;
            }

            let even = len % 2 === 0;
        });
    }

    toggleFocused(chartComponent) {
        this.charts.forEach(chart => chart.toggleFocus(chart === chartComponent));
    }

    setFocusToHighestIndex(): void {
        console.log(this.charts);

        if (!this.charts)
            return;

        let highest = 1,
            ref = this.charts.first;

        this.charts.forEach(chart => {
            if (chart.$el[0].style.zIndex > highest)
                ref = chart;
        });

        this.toggleFocused(ref);
    }

    getByHighestIndex(): InstrumentModel {
        return null;
    }

    geRandomPosition() {
        let containerH = this._elementRef.nativeElement.clientHeight,
            containerW = this._elementRef.nativeElement.clientWidth,
            chartH = 400,
            chartW = 800;

        return [_.random(0, containerH - chartH), _.random(0, containerW - chartW)]
    }
}