import {DialogAnchorDirective} from "../../directives/dialoganchor.directive";
declare var $:any;

import {Component, OnInit, OnDestroy, ElementRef, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild} from '@angular/core';
import * as moment          from 'moment/moment';
import * as _               from 'lodash';
import SocketService      from "../../services/socket.service";

import ChartOverviewService from "../../services/chart-overview.service";

// Load themes
import ThemeDefault from './theme/theme.default';
import './theme/theme.dark';
import {DialogComponent} from "../dialog/dialog.component";
import IndicatorModel from "../../models/indicator";

const Highcharts = require('highcharts/highstock');

@Component({
    selector: 'chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    entryComponents: [DialogComponent]
})

export class ChartComponent implements OnInit, OnDestroy {
    @ViewChild(DialogAnchorDirective) dialogAnchor: DialogAnchorDirective;

    @Input() options = <any>{};

    @Output() close = new EventEmitter();

    id: any;
    socket: any;
    nativeEl: HTMLElement;
    $el: any;
    $elChart: any;

    chart: any;
    timeFrame: string;
    instrument: string;
    lazyLoadingChunkSize: number;

    constructor(socketService: SocketService, private chartOverviewService: ChartOverviewService, private el: ElementRef) {
        this.socket = socketService.socket;
        this.nativeEl = el.nativeElement;
        this.$el = $(this.nativeEl);
    }

    async ngOnInit() {
        this.id = this.options.id;
        this.$elChart = this.$el.find('.chart-container');

        // Append optional className
        this.$el.find('.chart').addClass(this.options.className);

        this.chart = null;
        this.timeFrame = this.options.timeFrame;
        this.lazyLoadingChunkSize = 100;

        this.create();
        this.load();
    }

    create() {
        // Clone a new settings object
        let settings = _.cloneDeep(ThemeDefault);

        // create the chart
        this.chart = Highcharts.stockChart(this.$elChart[0], settings);

        //this._setIntervalUpdate();
    }

    load(from?, until?) {
        from = moment(new Date()).subtract(7, 'days').valueOf();
        until = Date.now();

        this.socket.emit('instrument:read', {
            id: this.id,
            count: 300,
            until: until,
            from: from
        }, data => {
            this.update(data);

            this.socket.emit('instrument:get-data', {
                id: this.id,
                count: data.length
            }, (err, data) => {
                if (err)
                    return alert('Error!' + err);

                this.updateIndicators(data);
            });
        });
    }

    update(_data:any[] = []) {
        if (!_data || !_data.length)
            return;

        let data = ChartComponent.prepareData(_data),
            last = data.candles[data.candles.length-1];

        this.chart.series[0].setData(data.candles);
        this.chart.xAxis[0].setExtremes(data.candles[data.candles.length-100][0], data.candles[data.candles.length-1][0]);

        this.chart.series[1].setData(data.volume);

        this.setCurrentPricePlot(last);
    }

    setCurrentPricePlot(bar) {
        this.chart.yAxis[0].removePlotLine('current-price');

        this.chart.yAxis[0].addPlotLine({
            value: bar[1],
            color: '#bcbbbc',
            width: 1,
            id: 'current-price',
            label: {
                text: `<div class="chart-current-price-label" style="background:white;">${bar[1]}</div>`,
                align: 'right',
                x: 5,
                y: 2,
                style: {
                    color: '#000'
                },
                useHTML: true,
                textAlign: 'left'
            }
        });
    }

    async addIndicator(name) {
        let length = this.chart.series[0].data.length,
            indicatorModel = await this.getIndicatorOptions(name);

        if (await this.showIndicatorOptionsMenu(indicatorModel))

            this.socket.emit('instrument:indicator:add', {id: this.id, name: name, options: indicatorModel.inputs, readCount: length, shift: 0}, (err, data) => {
                this.updateIndicators(data.data);
            });
    }

    updateIndicators(indicators) {
        for (let id in indicators) {
            for (let drawBufferName in indicators[id]) {
                let drawBuffer = indicators[id][drawBufferName];

                let unique = id + '_' + drawBuffer.id;

                // New series
                let series = this.chart.get(unique);

                // Update
                if (series) {
                    alert('series exists!');
                    console.log('SERIES!!!!', series);
                }

                // Create
                else {

                    this.chart.addSeries({
                        type: 'line',
                        name : id,
                        //id: unique,
                        data : drawBuffer.data,
                        color: drawBuffer.style.color,
                        yAxis: 0
                    });
                }
            }
        }
    }

    getIndicatorOptions(name: string): Promise<IndicatorModel> {
        return new Promise((resolve, reject) => {
            this.socket.emit('instrument:indicator:options', {name: name}, (err, data) => {
                err ? reject(err) : resolve(new IndicatorModel(data));
            });
        });
    }

    showIndicatorOptionsMenu(indicatorModel: IndicatorModel): Promise<IndicatorModel> {
        return new Promise((resolve) => {

            this.dialogAnchor.createDialog(DialogComponent, {
                title: indicatorModel.name,
                model: indicatorModel,
                buttons: [
                    {value: 'add', text: 'Add', type: 'primary'},
                    {text: 'Cancel', type: 'default'}
                ],
                onClickButton(value) {
                  if (value === 'add') {
                      resolve(true);
                  } else
                      resolve(false)
                }
            });
        });
    }

    setIndicatorOptions() {

    }

    static prepareData(data:any) {
        let length = data.length,
            volume = new Array(length),
            i = 0;

        for (; i < length; i+=1)
            volume[i] = [
                data[i][0], // Date
                data[i].pop() // Volume
            ];

        return {
            candles: data,
            volume: volume
        };
    }

    _setIntervalUpdate() {
        // set up the updating of the chart each second
        let series = this.chart.series[0].data;

        setInterval(() => {
            let last = this.chart.series[0].data[this.chart.series[0].data.length - 1];

            if (!last)
                return;

            var s1 = Math.random() * 2 + 70;
            var s2 = Math.random() * 2 + 70;
            var s3 = Math.random() * 2 + 70;
            series.addPoint([last.x + 100000000, s1, Math.max(s1, s2, s3), Math.min(s1, s2, s3), s3], true, true);
        }, 2000);
        setInterval(() => {

            var nv = Math.random() * 2 + 70;
            var last = this.chart.series[0].data[this.chart.series[0].data.length - 1];

            if (!last)
                return;

            var high = Math.max(last.high, nv);
            var low = Math.min(last.low, nv);

            last.update({
                'high': high,
                'low': low,
                'close': nv
            }, true);
            //series.xAxis.setExtremes(1133395200000, 1135900800000, false, false);
            //series.yAxis.setExtremes(68, 76, true, false);
        }, 500);
    }

    onClickClose() {
        this.chartOverviewService.destroy(this.id);

        this.close.emit(this.id);
    }

    ngOnDestroy() {

    }
}