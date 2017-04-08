'use strict';

import * as _               from 'lodash';
import {ElementRef, OnInit, Input, NgZone, Component, ChangeDetectionStrategy, OnDestroy} from '@angular/core';
import {InstrumentModel} from '../../models/instrument.model';

import {HighchartsDefaultTheme} from './themes/theme.default';
import {InstrumentsService} from '../../services/instruments.service';
import {IndicatorModel} from '../../models/indicator';
import {SocketService} from '../../services/socket.service';

const HighStock = require('highcharts/highstock');

@Component({
	selector: 'chart',
	exportAs: 'chart',
	styleUrls: ['./chart.component.scss'],
	templateUrl: './chart.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class ChartComponent implements OnInit, OnDestroy {

	@Input() type = 'stock';
	@Input() model: InstrumentModel;
	@Input() height: number;
	@Input() offset = 0;
	@Input() chunkLength = 1500;

	public chart: any;

	private _currentOffset = 0;

	constructor(private _elementRef: ElementRef,
				private _socketService: SocketService,
				private _zone: NgZone,
				private _instrumentsService: InstrumentsService) {
	}

	ngOnInit() {
		this._createChart();
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

	public addIndicator(indicatorModel: IndicatorModel) {
		return new Promise((resolve, reject) => {
			this._socketService.socket.emit('instrument:indicator:add', {
				id: this.model.data.id,
				name: indicatorModel.name,
				options: indicatorModel.inputs,
				readCount: this.chart.series[0].xData.length,
				shift: 0
			}, (err, data) => {
				if (err)
					return reject(err);

				this._updateIndicators(data.data);

				resolve();
			});
		});
	}

	public reflow() {
		this._zone.runOutsideAngular(() => {
			requestAnimationFrame(() => {
				this.chart.reflow();
				this._updateZoom();
			});
		});
	}

	private _createChart(): Promise<any> | void {
		this._zone.runOutsideAngular(() => {
			this.chart = HighStock.stockChart(this._elementRef.nativeElement.firstElementChild, _.cloneDeep(HighchartsDefaultTheme));
		});
	}

	private _updateZoom(redraw = true) {
		this._zone.runOutsideAngular(() => {
			let parentW = this._elementRef.nativeElement.parentNode.clientWidth,
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
		let {candles, indicators} = await this._instrumentsService.fetch(this.model, count, offset);

		this._updateBars(candles);
		this._updateIndicators(indicators);
	}

	private _updateBars(_data: any[] = []) {
		this._zone.runOutsideAngular(() => {
			if (!_data || !_data.length)
				return;

			let data = ChartComponent._prepareData(_data),
				last = data.candles[data.candles.length - 1];

			this.chart.series[0].setData(data.candles);
			this.chart.series[1].setData(data.volume);

			this._updateZoom();
			this._setCurrentPricePlot(last);
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

	private _updateIndicators(indicators) {
		this._zone.runOutsideAngular(() => {
			for (let id in indicators) {
				if (indicators.hasOwnProperty(id)) {
					for (let drawBufferName in indicators[id]) {
						if (indicators[id].hasOwnProperty(drawBufferName)) {
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
			}
		});
	}

	private _setScrollListener() {
		let ready = true,
			data = this.chart.series[0].xData,
			chart = this.chart;

		$(this.chart.container).bind('mousewheel DOMMouseScroll', (event: any) => {
			if (ready === false)
				return false;

			ready = false;

			this._zone.runOutsideAngular(() => {
				let // _event = chart.pointer.normalize(event),
					min, max, barsLength, diff;

				// if (!chart.isInsidePlot(_event.chartX - chart.plotLeft, _event.chartY - chart.plotTop))
				// 	return;

				barsLength = this._calculateViewableBars();
				diff = Math.ceil(barsLength / 10);

				// Up
				if (-event.originalEvent.detail || event.originalEvent.wheelDelta < 0) {
					this._currentOffset += diff;

					if (this._currentOffset > data.length - 1)
						this._currentOffset = data.length - 1;
				}
				// Down
				else {
					this._currentOffset -= diff;

					if (this._currentOffset < 0)
						this._currentOffset = 0;
				}

				min = data[data.length - 1 - this._currentOffset - barsLength];
				max = data[data.length - 1 - this._currentOffset];

				// Could be first or last bar
				if (min && max) {
					requestAnimationFrame(() => {
						chart.xAxis[0].setExtremes(min, max, true, false);
						ready = true;
					});
				} else {
					ready = true;
				}
			});

			return false;
		});
	}

	private _calculateViewableBars() {
		let parentW = this.chart.container.clientWidth,
			barW = 12.5;

		return Math.ceil(parentW / barW)
	}

	static _prepareData(data: any) {
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

	ngOnDestroy() {
		// Unbind scroll
		$(this.chart.container).off('mousewheel DOMMouseScroll');

		// Destroy chart
		this.chart.destroy();
		this.chart = null;

		// Destroy data;
	}
}