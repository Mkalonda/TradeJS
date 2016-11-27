declare var $:any;

import {Component, OnInit, OnDestroy, ElementRef, Input, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import * as moment          from 'moment/moment';
import * as _               from 'lodash';
import {SocketService}      from "../../services/socket.service";

import ChartOverviewService from "../../services/chart-overview.service";

// Load themes
import ThemeDefault from './theme/theme.default';
import './theme/theme.dark';

const Highcharts = require('highcharts/highstock');

@Component({
    selector: 'chart',
    templateUrl: 'chart.component.html',
    styleUrls: ['chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChartComponent implements OnInit, OnDestroy {

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

                this.setIndicators(data);
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

    addIndicator(name) {
        this.socket.emit('instrument:indicator:add', {id: this.id, name: name}, data => {

        });
    }

    setIndicators(indicators) {

        for (let name in indicators) {

            for (let drawBuffer in indicators[name]) {

                let data = indicators[name][drawBuffer].data;

                this.chart.addSeries({
                    type: 'line',
                    name : name,
                    data : indicators[name][drawBuffer].data,
                    color: 'red',
                    yAxis: 0
                });
            }
        }
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