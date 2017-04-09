import * as _ from 'lodash';
import {
	Component, OnDestroy, ElementRef, Input, Output, EventEmitter, ViewChild,
	OnInit, AfterViewInit, ChangeDetectionStrategy, ContentChild
} from '@angular/core';

import {SocketService}      from '../../services/socket.service';
import {DialogComponent} from '../dialog/dialog.component';
import {IndicatorModel} from '../../models/indicator';
import {InstrumentModel} from '../../models/instrument.model';
import {InstrumentsService} from '../../services/instruments.service';
import {ChartComponent} from '../../common/chart/chart.component';
import {CookieService} from 'ngx-cookie';
import {ResizableDirective} from '../../directives/resizable.directive';
import {DraggableDirective} from '../../directives/draggable.directive';
import {DialogAnchorDirective} from '../../directives/dialoganchor.directive';

declare let $: any;

@Component({
	selector: 'chart-box',
	templateUrl: './chart-box.component.html',
	styleUrls: ['./chart-box.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	entryComponents: [DialogComponent]
})

export class ChartBoxComponent implements OnInit, OnDestroy, AfterViewInit {

	@Input() model: InstrumentModel;
	@Input() focus = true;
	@Input() viewState = 'windowed';
	@Input() minimized = false;

	@ViewChild(ChartComponent) public _chartComponent: ChartComponent;
	@ViewChild(DialogAnchorDirective) private _dialogAnchor: DialogAnchorDirective;
	@ViewChild(ResizableDirective) private _resizableDirective: ResizableDirective;
	@ViewChild(DraggableDirective) private _draggableDirective: DraggableDirective;

	socket: any;
	$el: any;

	constructor(private _instrumentsService: InstrumentsService,
				private _socketService: SocketService,
				private _cookieService: CookieService,
				private _elementRef: ElementRef) {
	}

	ngOnInit() {
		this.socket = this._socketService.socket;
		this.$el = $(this._elementRef.nativeElement);

		if (this.viewState === 'windowed')
			this.restorePosition();

		this.toggleViewState(this.viewState, false);
	}

	ngAfterViewInit() {
		this._resizableDirective.changed.subscribe(() => this.storePosition());
		this._draggableDirective.changed.subscribe(() => this.storePosition());

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
		this.focus = state;

		if (state) {
			this.putOnTop();
			this.toggleViewState(true);
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

	public getPosition(): any {
		let position = {
			x: parseInt(this._elementRef.nativeElement.getAttribute('data-x'), 10),
			y: parseInt(this._elementRef.nativeElement.getAttribute('data-y'), 10),
			w: this._elementRef.nativeElement.clientWidth,
			h: this._elementRef.nativeElement.clientHeight
		};

		console.log('position', position);

		return position;
	}

	public setPosition(y: number | string, x: number | string): void {
		this._elementRef.nativeElement.style.transform = `translate(${x}px, ${y}px)`;
		this._elementRef.nativeElement.setAttribute('data-x', x);
		this._elementRef.nativeElement.setAttribute('data-y', y);
	}

	public storePosition() {
		this._cookieService.putObject(`instrument-${this.model.data.id}`, this.getPosition())
	}

	public restorePosition(position?: any): void {
		position = position || <any>this._cookieService.getObject(`instrument-${this.model.data.id}`);

		if (position) {
			this.setPosition(position.y, position.x);
			this.setSize(position.w, position.h);
		}
		else {
			this.setRandomPosition();
			this.storePosition();
		}
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

	public getIndicatorOptions(name: string): Promise<IndicatorModel> {
		return new Promise((resolve, reject) => {
			this.socket.emit('instrument:indicator:options', {name: name}, (err, data) => {
				err ? reject(err) : resolve(new IndicatorModel(data));
			});
		});
	}

	public toggleViewState(viewState: string | boolean, reflow = true) {
		let elClassList = this._elementRef.nativeElement.classList;

		if (typeof viewState === 'string') {

			if (this.viewState !== viewState) {

				elClassList.remove(this.viewState);
				elClassList.add(viewState);

				this.viewState = viewState;

				if (reflow) {
					this._chartComponent.reflow();
				}
			}
		} else {
			elClassList.toggle('minimized', !viewState);
		}
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