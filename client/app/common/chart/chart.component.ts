import * as _               from 'lodash';
import {
	ElementRef, OnInit, Input, AfterViewInit, NgZone, Component, ChangeDetectionStrategy,
	ChangeDetectorRef
} from '@angular/core';
import {InstrumentModel} from '../../models/instrument.model';

// Themes
import {HighchartsDefaultTheme} from './themes/theme.default';
// import './themes/theme.dark';
import {InstrumentsService} from '../../services/instruments.service';

const HighStock = require('highcharts/highstock');

@Component({
	selector: 'chart',
	exportAs: 'chart',
	styleUrls: ['./chart.component.scss'],
	template: ''
})

export class ChartComponent implements OnInit, AfterViewInit {

	@Input() type = 'stock';
	@Input() model: InstrumentModel;
	@Input() height: number;
	@Input() offset = 0;
	@Input() chunkLength = 1500;

	public loading = true;
	public chart: any;
	public chartEl: any;

	public last;
	public first;

	constructor(public elementRef: ElementRef,
				private changeDetectorRef: ChangeDetectorRef,
				private zone: NgZone,
				private _instrumentsService: InstrumentsService) {
	}

	ngOnInit() {
		this.changeDetectorRef.detach();
	}

	async ngAfterViewInit() {
		await this._createChart();
		this._setScrollListener();

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


	public setHeight(height?: number): void {
		height = height || this.elementRef.nativeElement.parentNode.clientHeight;

		this.chartEl.style.height = height + 'px';
	}

	public reflow() {
		requestAnimationFrame(() => {
			this.chart.reflow();
			this._updateZoom();
		});
	}

	private _createChart(): Promise<any> {
		return new Promise((resolve, reject) => {

			this.zone.runOutsideAngular(() => {
				// Clone a new settings object
				let settings = _.cloneDeep(HighchartsDefaultTheme),
					div = document.createElement('div');

				div.style.height = '100%';
				window['test'] = this.chartEl = div;
				this.elementRef.nativeElement.appendChild(div);
				// this.setHeight();

				requestAnimationFrame(() => {
					if (this.type === 'stock') {
						// create the chart
						this.chart = HighStock.stockChart(div, settings);
					}
					else if (this.type === 'line') {

					}

					resolve();
				});
			});
		});
	}

	private _setScrollListener() {
		let ready = true;

		$(this.chartEl).bind('mousewheel DOMMouseScroll', (event: any) => {
			if (ready === false)
				return false;

			ready = false;
			this.zone.runOutsideAngular(() => {
				requestAnimationFrame(() => {
					let chart = this.chart,
						delta, extr, step, newMin, newMax, _event, axis = chart.xAxis[0];

					_event = chart.pointer.normalize(event);

					// Firefox uses e.detail, WebKit and IE uses wheelDelta
					delta = (-event.originalEvent.detail || event.originalEvent.wheelDelta);
					delta = delta < 0 ? 1 : -1;

					if (chart.isInsidePlot(_event.chartX - chart.plotLeft, _event.chartY - chart.plotTop)) {
						extr = axis.getExtremes();

						let min = this.chart.xAxis[0].series[0].data;

						step = (extr.max - extr.min) / 10 * delta;
						axis.setExtremes(extr.min + step, extr.max + step, true, false);
					}

					ready = true;
				});
			});

			return  false;
		});
	}

	private _updateZoom(redraw = true) {
		this.zone.runOutsideAngular(() => {
			let parentW = this.elementRef.nativeElement.parentNode.clientWidth,
				data = this.chart.xAxis[0].series[0].data,
				barW = 12.5,
				barsToShow = Math.ceil(parentW / barW),
				firstBar = (data[data.length - barsToShow] || data[0]),
				lastBar = data[data.length - 1];

			if (firstBar && lastBar)
				this.chart.xAxis[0].setExtremes(firstBar.x, lastBar.x, redraw, false);
		});
	}

	private async _fetch(count: number, offset: number) {
		this.loading = true;

		let {candles, indicators} = await this._instrumentsService.fetch(this.model, count, offset);

		this._updateBars(candles);
		this.updateIndicators(indicators);
	}

	private _updateBars(_data: any[] = []) {
		this.zone.runOutsideAngular(() => {
			if (!_data || !_data.length)
				return;

			let data = this.prepareData(_data),
				last = data.candles[data.candles.length - 1];

			this.chart.series[0].setData(data.candles);
			this.chart.series[1].setData(data.volume);

			this._updateZoom();
			this._setCurrentPricePlot(last);

			this.loading = false;
		});
	}

	private _setCurrentPricePlot(bar) {
		this.chart.yAxis[0].removePlotLine('current-price');

		this.chart.yAxis[0].addPlotLine({
			value: bar[1],
			color: '#646467',
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

				let unique = id + '_' + drawBuffer.id;

				// New series
				let series = this.chart.get(unique);

				// Update
				if (series) {
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
						yAxis: 0,
						dataGrouping: {
							enabled: false
						}
					});
				}
			}
		}
	}

	prepareData(data: any) {
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