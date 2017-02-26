import * as _ from 'lodash';
import {DialogAnchorDirective} from '../../directives/dialoganchor.directive';
import {
    Component, OnDestroy, ElementRef, Input, Output, EventEmitter, ViewChild,
    OnInit, AfterViewInit
} from '@angular/core';

import SocketService      from '../../services/socket.service';

// Load themes
import {DialogComponent} from '../dialog/dialog.component';
import IndicatorModel from '../../models/indicator';
import {InstrumentModel} from '../../models/instrument.model';
import InstrumentsService from '../../services/instruments.service';
import {ChartDirective} from '../../directives/chart/chart.directive';

declare let $: any;

@Component({
    selector: 'chart-box',
    templateUrl: './chart-box.component.html',
    styleUrls: ['./chart-box.component.scss'],
    entryComponents: [DialogComponent]
})

export class ChartBoxComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(DialogAnchorDirective) private _dialogAnchor: DialogAnchorDirective;
    @ViewChild(ChartDirective) public chart: ChartDirective;

    @Input() model: InstrumentModel;
    @Input() focus = true;
    @Input() mode = 'windowed';
    @Input() startRandomized = true;

    @Output() closed = new EventEmitter();
    @Output() focused = new EventEmitter();
    @Output() resize = new EventEmitter();

    socket: any;
    $el: any;
    $elLoadingOverlay: any;

    constructor(
        private _instrumentsService: InstrumentsService,
        private _socketService: SocketService,
        private _elementRef: ElementRef) {}

    ngOnInit() {

    }

    ngAfterViewInit() {
        this.socket = this._socketService.socket;
        this.$el = $(this._elementRef.nativeElement);
        this.$elLoadingOverlay = this.$el.find('.chart-loading-overlay');

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
                this.chart.reflow();
            }
        });

        if (this.startRandomized)
            this.setRandomPosition();

        this.putOnTop();

        this.model.changed.subscribe(() => {});
    }

    public setRandomPosition() {
        let pos = this._getRandomPosition();

        this.setPosition(pos[0], pos[1]);
    }

    public setAsHighestPosition() {
        let pos = this._getRandomPosition();

        this.setPosition(pos[0], pos[1]);
    }

    public forceChartInCorner(edges): void {
        let el = this.chart.elementRef.nativeElement;

        el.style.position = 'absolute';

        if (edges.right || edges.left) {
            el.style.left = 'auto';
            el.style.right = 0;
        }
    }

    public unlockChartFromCorner(): void {
        let el = this.chart.elementRef.nativeElement;

        el.style.position = 'static';

        this.chart.reflow();
    }

    toggleFocus(state: boolean): void {
        if (this.focus === state)
            return;

        this.focus = state;

        if (state) {
            this.putOnTop();
        }

        // this.focused.next()
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

    public setSize(width: number|string, height: number|string): void {
        this.$el.width(width).height(height);

        this.chart.reflow();
    }

    public setPosition(top: number|string, left: number|string): void {
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

        this.chart.reflow();
    }


    async addIndicator(name) {
        let length = this.chart.chart.series[0].data.length,
            indicatorModel = await this.getIndicatorOptions(name);

        if (await this.showIndicatorOptionsMenu(indicatorModel))

            this.socket.emit('instrument:indicator:add', {
                id: this.model.data.id,
                name: name,
                options: indicatorModel.inputs,
                readCount: length,
                shift: 0
            }, (err, data) => {
                this.chart.updateIndicators(data.data);
            });
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

    public showIndicatorOptionsMenu(indicatorModel: IndicatorModel): Promise<IndicatorModel> {
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

    destroy() {
        this._instrumentsService.remove(this.model);
    }

    async ngOnDestroy() {
        // await this._destroyOnServer();
    }
}