import * as _               from 'lodash';
import {Directive, ElementRef, OnInit, Input, AfterViewInit} from '@angular/core';
import {InstrumentModel} from '../../models/instrument.model';

// Themes
import ThemeDefault from './themes/theme.default';
import './themes/theme.dark';
import InstrumentsService from '../../services/instruments.service';

const HighStock = require('highcharts/highstock');

@Directive({
    selector: '[chart]',
    exportAs: 'chart'
})

export class ChartDirective implements OnInit, AfterViewInit {

    @Input() type = 'stock';
    @Input() model: InstrumentModel;
    @Input() height: number;
    @Input() offset = 0;
    @Input() chunkLength = 50;

    public loading = true;
    public chart: any;

    constructor(
        public elementRef: ElementRef,
        private _instrumentsService: InstrumentsService) {
    }

    ngOnInit() {}

    ngAfterViewInit() {
        if (this.height)
            this.setHeight(this.height);

        this._createChart();

        if (!this.model)
            return;

        if (!this.model.data.id) {
            let subscription = this.model.synced.subscribe(() => {
                subscription.unsubscribe();

                this._fetch(this.chunkLength, this.offset);
            });
        } else {
            this._fetch(this.chunkLength, this.offset);
        }
    }


    public setHeight(height: number): void {
        height = height || this.elementRef.nativeElement.parentNode.clientHeight;

        this.elementRef.nativeElement.style.height = height + 'px';
    }

    public reflow() {
        requestAnimationFrame(() => {
            this.chart.reflow();
            this._updateZoom();
            // requestAnimationFrame(() => this.chart.reflow())
        });
    }

    private _updateZoom(redraw = true) {
        let parentW = this.elementRef.nativeElement.parentNode.clientWidth,
            data = this.chart.xAxis[0].series[0].data,
            barW = 12.5,
            barsToShow = Math.ceil(parentW / barW),
            firstBar = (data[data.length - barsToShow] || data[0]),
            lastBar = data[data.length - 1];

        this.chart.xAxis[0].setExtremes(firstBar.x, lastBar.x, redraw, false);
    }

    private _createChart(): void {
        // Clone a new settings object
        let settings = _.cloneDeep(ThemeDefault);

        if (this.type === 'stock') {
            // create the chart
            this.chart = HighStock.stockChart(this.elementRef.nativeElement, settings);
        }
        else if (this.type === 'line') {

        }
    }

    private async _fetch(count: number, offset: number) {
        this.loading = true;

        let {candles, indicators} = await this._instrumentsService.fetch(this.model, count, offset);

        this._updateBars(candles);
        this.updateIndicators(indicators);
    }

    private _updateBars(_data: any[] = []) {
        if (!_data || !_data.length)
            return;

        let data = this.prepareData(_data),
            last = data.candles[data.candles.length - 1];

        this.chart.series[0].setData(data.candles);
        this.chart.series[1].setData(data.volume);

        this._updateZoom();
        this._setCurrentPricePlot(last);

        this.loading = false;
    }

    private _setCurrentPricePlot(bar) {
        this.chart.yAxis[0].removePlotLine('current-price');

        this.chart.yAxis[0].addPlotLine({
            value: bar[1],
            color: '#939293',
            width: 1,
            id: 'current-price',
            label: {
                text: `<div class='chart-current-price-label' style='background:white;'>${bar[1]}</div>`,
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

    updateIndicators(indicators) {
        for (let id in indicators) {
            if (!indicators.hasOwnProperty(id))
                return;

            for (let drawBufferName in indicators[id]) {
                if (!indicators[id].hasOwnProperty(drawBufferName))
                    return;

                let drawBuffer = indicators[id][drawBufferName];

                drawBuffer.data = drawBuffer.data.reverse();

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
                        name: id,
                        // id: unique,
                        data: drawBuffer.data,
                        color: drawBuffer.style.color,
                        yAxis: 0
                    });
                }
            }
        }
    }

    prepareData(data: any) {
        data = data.reverse();

        let length = data.length,
            volume = new Array(length),
            i = 0;

        for (; i < length; i += 1)
            volume[i] = [
                data[i][0], // Date
                data[i].pop() // Volume
            ];

        return {
            candles: data,
            volume: volume
        };
    }
}