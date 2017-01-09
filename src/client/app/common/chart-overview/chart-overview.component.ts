import * as _ from 'lodash';
import {
    Component, ViewChild, OnInit, ElementRef, Output, EventEmitter, ViewContainerRef,
    ComponentFactoryResolver, ComponentRef
}  from '@angular/core';
import SocketService      from "../../services/socket.service";
import {InstrumentSettings} from "../../../../shared/interfaces/InstrumentSettings";
import {ChartComponent} from "../chart/chart.component";

@Component({
    selector: 'chart-overview',
    templateUrl: './chart-overview.component.html',
    styleUrls: ['./chart-overview.component.scss'],
    entryComponents: [ChartComponent]
})

export default class ChartOverviewComponent implements OnInit {

    // `ViewContainerRef` from an element in the view
    @ViewChild('container', {read: ViewContainerRef}) private _container;

    @Output() public close = new EventEmitter();

    public charts: Array<ComponentRef<ChartComponent>> = [];

    private _mode: string = 'windowed';
    private _defaults = [{instrument: 'EUR_USD'}, {instrument: 'AUD_CAD'}];

    constructor(
        private _elementRef: ElementRef,
        private _componentFactoryResolver: ComponentFactoryResolver,
        private _socketService: SocketService
    ) {}

    ngOnInit() {
        this.load();
    }

    load() {

        this._socketService.socket.emit('instrument:chart-list', {}, (err, list: InstrumentSettings[]) => {

            if (err)
                return console.error(err);

            if (!list || !list.length)
                list = this._defaults;

            list.forEach((instrumentSettings: InstrumentSettings) => this.add(instrumentSettings));
        });
    }

    add(options = <any>{}): ComponentRef<ChartComponent> {
        let chartComponentFactory = this._componentFactoryResolver.resolveComponentFactory(ChartComponent),
            chartComponentRef = this._container.createComponent(chartComponentFactory),
            chartInstance = chartComponentRef.instance,
            randomPos = this.geRandomPosition();

        this.charts.push(chartComponentRef);

        chartInstance.setPosition(randomPos[0], randomPos[1]);

        chartInstance.options = options;

        chartInstance.focus.subscribe(() => this.setFocus(chartComponentRef));
        chartInstance.resize.subscribe((params) => {

            switch (params.state) {
                case 'stretched':
                    this.setModeStretched(params.id);
                    break;
                case 'windowed':
                    this.setModeWindowed();
                    break;
            }
        });

        chartInstance.close.subscribe(() => {

            chartInstance.resize.unsubscribe();
            chartInstance.close.unsubscribe();
            chartInstance.focus.unsubscribe();

            chartComponentRef.destroy();

            this.charts.splice(this.charts.indexOf(chartComponentRef), 1);

            this.setFocus();
        });

        // Set focus
        requestAnimationFrame(() => {
            this.setFocus(chartComponentRef);
        });

        return chartComponentRef;
    }

    clear() {
        this._container.clear();
    }

    setFocus(chartRef?: ComponentRef<ChartComponent>) {
        chartRef = chartRef || this.getByHighestZIndex();

        if (!chartRef || chartRef.instance.focused)
            return;

        this.setAllBlurred();

        if (this._mode === 'stretched') {
            chartRef.instance.$el.siblings().hide();
            chartRef.instance.$el.show();
        }

        chartRef.instance.setFocused();
    }

    setAllBlurred() {
        this.charts.forEach(chart => chart.instance.setBlurred());
    }

    setModeStretched(id) {
        this._mode = 'stretched';

        let charts = this.charts,
            i = 0, len = charts.length,
            chart;

        for (; i < len; i++) {
            chart = charts[i].instance;
            if (chart.options.id !== id) {
                chart.$el.hide();
                continue;
            }

            chart.mode = 'stretched';
            chart.clearPosition();
            chart.setSize('100%', '100%', true);
        }
    }

    setModeWindowed() {
        this._mode = 'windowed';

        let charts = this.charts,
            i = 0, len = charts.length;

        // First set new size of all
        for (; i < len; i++) {
            charts[i].instance.mode = 'windowed';
            charts[i].instance.restorePosition();
        }

        // Then show all
        for (i = 0; i < len; i++)
            charts[i].instance.$el.show();
    }

    getById(id): ComponentRef<ChartComponent> {
        let charts = this.charts,
            i = 0, len = charts.length;

        for (; i < len; i++)
            if (charts[i].instance.options.id === id)
                return charts[i];

        return null;
    }

    getByHighestZIndex() {
        let highest = 0,
            ref = this.charts[0];

        this.charts.forEach(chart => {
            if (chart.instance.$el[0].style.zIndex > highest)
                ref = chart;
        });

        return ref;
    }

    tileWindows() {
        let charts = this.charts,
            containerH = this._elementRef.nativeElement.clientHeight,
            containerW = this._elementRef.nativeElement.clientWidth,
            len = charts.length;

        charts.forEach((chart, i) => {
            let instance = chart.instance;
            instance.$el.removeAttr('style').addClass('animate');

            setTimeout(() => {
                instance.$el.removeClass('animate');
            }, 400);

            if (len < 4) {
                let chartW = Math.floor(containerW / len);
                instance.tiled = true;
                instance.setSize(chartW, containerH-2);
                instance.setPosition(0, (i * chartW) + (i * 1));
                return;
            }

            let even = len % 2 === 0;
        });
    }

    geRandomPosition() {
        console.log(this._elementRef.nativeElement);
        let containerH = this._elementRef.nativeElement.clientHeight,
            containerW = this._elementRef.nativeElement.clientWidth,
            chartH = 400,
            chartW = 800;

        return [_.random(0, containerH-chartH), _.random(0, containerW-chartW)]
    }
}