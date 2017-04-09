import * as _               from 'lodash';
import {ElementRef, OnInit, Input, Component, ChangeDetectionStrategy, OnDestroy} from '@angular/core';
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

	private _chart: any;
	private _onScrollBounced: Function = null;

	private _scrollOffset = -1;
	private _scrollSpeedStep = 10;
	private _scrollSpeedMin = 2;
	private _scrollSpeedMax = 15;

	private _zoom = 5;
	private _zoomMax = 10;
	private _zoomMin = 1;

	constructor(private _elementRef: ElementRef,
				private _socketService: SocketService,
				private _instrumentsService: InstrumentsService) {
	}

	public ngOnInit() {
		// Bouncer func to limit onScroll calls
		this._onScrollBounced = _.throttle(this._onScroll.bind(this), 25);

		// HighStock instance
		this._chart = HighStock.stockChart(this._elementRef.nativeElement.firstElementChild, _.cloneDeep(HighchartsDefaultTheme));

		// Scroll listener
		this._chart.container.addEventListener('mousewheel', <any>this._onScrollBounced);

		// Just an empty chart
		if (!this.model)
			return;

		// Create new server instrument
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
				readCount: this._chart.series[0].xData.length,
				shift: 0
			}, (err, data) => {
				if (err)
					return reject(err);

				this._updateIndicators(data.data);

				resolve();
			});
		});
	}

	public pinToCorner(edges): void {
		let el = this._chart.container;

		el.style.position = 'absolute';

		if (edges.right || edges.left) {
			el.style.left = 'auto';
			el.style.right = 0;
		}
	}

	public unpinFromCorner(reflow = true): void {
		this._chart.container.style.position = 'static';

		if (reflow)
			this.reflow();
	}

	public reflow() {
		// Sync
		this._updateViewPort(false);

		// Async
		requestAnimationFrame(() => this._chart.reflow());
	}

	public zoom(step) {
		if (this._zoom + step > this._zoomMax || this._zoom + step < this._zoomMin)
			return;

		this._zoom += step;
		requestAnimationFrame(() => this._updateViewPort());
	}

	public toggleTimeFrame(timeFrame) {

	}



	private _updateViewPort(redraw = true, shift = 0) {
		let data = this._chart.series[0].xData,
			offset = this._scrollOffset + shift,
			viewable = this._calculateViewableBars(),
			minOffset = 0,
			maxOffset = data.length - 1 - viewable,
			min, max;

		if (offset > maxOffset)
			offset = maxOffset;
		else if (offset < minOffset)
			offset = minOffset;

		this._scrollOffset = offset;

		max = data[data.length - offset];
		min = data[data.length - offset - viewable];

		this._chart.xAxis[0].setExtremes(min, max, redraw, false);
	}

	private async _fetch(count: number, offset: number) {
		let {candles, indicators} = await this._instrumentsService.fetch(this.model, count, offset);

		this._updateBars(candles);
		this._updateIndicators(indicators);
	}

	private _updateBars(data: any[] = []) {
		let {candles, volume} = ChartComponent._prepareData(data),
			last = candles[candles.length - 1];

		this._chart.series[0].setData(candles, false, false);
		this._chart.series[1].setData(volume, false, false);

		// Re-update viewport needed for initial batch of bars
		this._updateViewPort();

		// PlotLine cannot be delayed, so to prevent instant re-render from updateViewPort,
		// Do this after
		this._setCurrentPricePlot(last);
	}

	private _setCurrentPricePlot(bar) {
		this._chart.yAxis[0].removePlotLine('current-price');

		this._chart.yAxis[0].addPlotLine({
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
		for (let id in indicators) {
			if (indicators.hasOwnProperty(id)) {
				for (let drawBufferName in indicators[id]) {
					if (indicators[id].hasOwnProperty(drawBufferName)) {
						let drawBuffer = indicators[id][drawBufferName];

						let unique = id + '_' + drawBuffer.id;

						// New series
						let series = this._chart.get(unique);

						// Update
						if (series) {
							console.log('SERIES!!!!', series);
						}

						// Create
						else {
							this._chart.addSeries({
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
	}

	/*
		Stop highchart from moving the Y axis so much
		TODO: improve
	 */
	private _getSurroundingPriceRange(padding = 200, viewable) {
		let data = this._chart.series[0].yData,
			i = data.length - this._scrollOffset - viewable - padding,
			len = (data.length - this._scrollOffset) + padding,
			price, low, high;

		if (i < 0)
			i = 0;

		if (len > data.length)
			len = data.length;

		for (; i < len; ++i) {
			price = data[i][0];
			if (!high || price > high) {
				high = price;
			} else if (!low || price < low) {
				low = price;
			}
		}

		return {low, high};
	}

	private _calculateViewableBars(checkParent = true) {
		let el = this._elementRef.nativeElement,
			barW = 3 * this._zoom;

		if (checkParent)
			el = el.parentNode;

		return Math.floor(el.clientWidth / barW);
	}

	private _onScroll(event: MouseWheelEvent): boolean {
		event.stopPropagation();
		event.preventDefault();

		let shift = Math.ceil(this._calculateViewableBars() / this._scrollSpeedStep);

		if (shift < this._scrollSpeedMin)
			shift = this._scrollSpeedMin;
		else if (shift > this._scrollSpeedMax)
			shift = this._scrollSpeedMax;

		this._updateViewPort(true, event.wheelDelta > 0 ? -shift : shift);

		return false;
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

	public ngOnDestroy() {
		// Unbind scroll
		this._chart.container.removeEventListener('mousewheel', <any>this._onScrollBounced);

		// Destroy chart
		this._chart.destroy();
		this._chart = null;
	}
}