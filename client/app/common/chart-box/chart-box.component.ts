import * as _ from 'lodash';
import {DialogAnchorDirective} from '../../directives/dialoganchor.directive';
import {
	Component, OnDestroy, ElementRef, Input, Output, EventEmitter, ViewChild,
	OnInit, AfterViewInit, ChangeDetectionStrategy
} from '@angular/core';

import {SocketService}      from '../../services/socket.service';
import {DialogComponent} from '../dialog/dialog.component';
import {IndicatorModel} from '../../models/indicator';
import {InstrumentModel} from '../../models/instrument.model';
import {InstrumentsService} from '../../services/instruments.service';
import {ChartComponent} from '../../common/chart/chart.component';

declare let $: any;

@Component({
	selector: 'chart-box',
	templateUrl: './chart-box.component.html',
	styleUrls: ['./chart-box.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	entryComponents: [DialogComponent]
})

export class ChartBoxComponent implements OnInit, OnDestroy, AfterViewInit {

	@ViewChild(ChartComponent) protected _chartComponent: ChartComponent;
	@ViewChild(DialogAnchorDirective) private _dialogAnchor: DialogAnchorDirective;

	@Input() model: InstrumentModel;
	@Input() focus = true;
	@Input() mode = 'windowed';
	@Input() startRandomized = true;

	@Output() resize = new EventEmitter();

	socket: any;
	$el: any;
	$elLoadingOverlay: any;

	constructor(private _instrumentsService: InstrumentsService,
				private _socketService: SocketService,
				private _elementRef: ElementRef) {
	}

	ngOnInit() {
		this.socket = this._socketService.socket;
		this.$el = $(this._elementRef.nativeElement);
		this.$elLoadingOverlay = this.$el.find('.chart-loading-overlay');

		if (this.startRandomized)
			this.setRandomPosition();

		this.resize.subscribe(mode => {
			this.mode = mode || this.mode;

			if (mode === 'stretched') {
				this.clearPosition();
				this.setSize('100%', '100%');
			}
			else if (mode === 'windowed') {
				this.restorePosition();
			}
			else {
				// this._chartComponent.reflow();
			}
		});

		this.model.changed.subscribe(() => {
		});
	}

	ngAfterViewInit() {
		this.putOnTop();
	}

	public showIndicatorOptionsMenu(indicatorModel: IndicatorModel): Promise<boolean> {
		return new Promise((resolve) => {

			this._dialogAnchor.createDialog(DialogComponent, {
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
						resolve(false);
				}
			});
		});
	}

	public setRandomPosition() {
		let pos = this._getRandomPosition();

		this.setPosition(pos[0], pos[1]);
	}

	public setAsHighestPosition() {
		let pos = this._getRandomPosition();

		this.setPosition(pos[0], pos[1]);
	}

	public toggleFocus(state: boolean): void {
		if (this.focus === state)
			return;

		this.focus = state;

		if (state) {
			this.putOnTop();
		}
	}

	public putOnTop() {
		let selfIndex = parseInt(this.$el.css('z-index'), 10) || 1,
			highestIndex = selfIndex;

		this.$el.siblings().each((key, el) => {
			let zIndex = parseInt(el.style.zIndex, 10) || 1;

			if (zIndex > highestIndex)
				highestIndex = zIndex;
		});

		this.$el.css('z-index', selfIndex <= highestIndex ? highestIndex + 1 : highestIndex);
	}

	public setSize(width: number | string, height: number | string): void {
		this.$el.width(width).height(height);

		this._chartComponent.reflow();
	}

	public setPosition(top: number | string, left: number | string): void {
		this._elementRef.nativeElement.style.transform = `translate(${left}px, ${top}px)`;
		this._elementRef.nativeElement.setAttribute('data-x', left);
		this._elementRef.nativeElement.setAttribute('data-y', top);
	}

	public clearPosition(): void {
		this.storeCurrentPosition();

		this.$el.css({top: 0, left: 0, bottom: 0, transform: 'none'});
	}

	public storeCurrentPosition() {
		this._elementRef.nativeElement.setAttribute('data-o-style',
			this._elementRef.nativeElement.getAttribute('style')
		);
	}

	public restorePosition(): void {
		let old = this.$el.attr('data-o-style');

		if (old)
			this.$el[0].style.cssText = old;

		this._chartComponent.reflow();
	}

	public async addIndicator(name) {
		let indicatorModel = await this.getIndicatorOptions(name),
			options = {};

		if (await this.showIndicatorOptionsMenu(indicatorModel) === false)
			return;

		// Normalize model values
		_.forEach(indicatorModel.inputs, input => {
			switch (input.type) {
				case 'number':
					input.value = parseInt(input.value, 10);
					break;
				case 'text':
					input.value = String.prototype.toString.call(input.value);
					break;
			}

			options[input.name] = input.value
		});

		indicatorModel.inputs = options;

		this._chartComponent.addIndicator(indicatorModel);
	}

	getIndicatorOptions(name: string): Promise<IndicatorModel> {
		return new Promise((resolve, reject) => {
			this.socket.emit('instrument:indicator:options', {name: name}, (err, data) => {
				err ? reject(err) : resolve(new IndicatorModel(data));
			});
		});
	}

	private _getRandomPosition() {
		let el = this._elementRef.nativeElement,
			containerH = el.parentNode.clientHeight,
			containerW = el.parentNode.clientWidth,
			chartH = el.clientHeight,
			chartW = el.clientWidth;

		return [_.random(0, containerH - chartH), _.random(0, containerW - chartW)];
	}

	destroy() {
		this._instrumentsService.remove(this.model);
	}

	async ngOnDestroy() {
		// await this._destroyOnServer();
	}
}