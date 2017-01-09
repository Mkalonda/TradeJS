import {DialogAnchorDirective} from "../../directives/dialoganchor.directive";
import {
    Component, OnDestroy, ElementRef, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild,
    OnInit, AfterViewInit
} from '@angular/core';
import * as moment          from 'moment/moment';
import * as _               from 'lodash';
import SocketService      from "../../services/socket.service";

// Load themes
import ThemeDefault from './theme/theme.default';
import './theme/theme.dark';
import {DialogComponent} from "../dialog/dialog.component";
import IndicatorModel from "../../models/indicator";
import {InstrumentSettings} from "../../../../shared/interfaces/InstrumentSettings";

const HighStock = require('highcharts/highstock');
const interact = require('interactjs');

declare var $:any;

@Component({
    selector: 'chart',
    templateUrl: './chart.component.html',
    styleUrls: ['./chart.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    entryComponents: [DialogComponent]
})

export class ChartComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(DialogAnchorDirective) private _dialogAnchor: DialogAnchorDirective;

    @Input() public options = <any>{};

    @Output() public close = new EventEmitter();
    @Output() public focus = new EventEmitter();
    @Output() public resize = new EventEmitter();

    public mode: string = 'windowed';
    public tiled: boolean = false;
    public focused: boolean = false;

    private _defaults: InstrumentSettings = {
        instrument: null,
        timeFrame: 'M15'
    };

    socket: any;
    $el: any;
    $elChart: any;
    $elLoadingOverlay: any;

    chart: any = null;

    constructor(
        private _socketService: SocketService,
        private _elementRef: ElementRef) {}

    ngOnInit() {
        this.options = Object.assign({until: Date.now()}, this._defaults, this.options);

        this.socket = this._socketService.socket;
        this.$el = $(this._elementRef.nativeElement);
        this.$elChart = this.$el.find('.chart-container');
        this.$elLoadingOverlay = this.$el.find('.chart-loading-overlay');

        this.close.subscribe(() => this._destroyOnServer());
    }

    ngAfterViewInit() {
        if (!this.options.id)
            this._createOnServer(this.options).then(options => {
                Object.assign(this.options, options);

                this._load();
            });
        else
            this._load();

        this._createChart();

        this._setUIHandles();
    }

    public setFocused() {
        this.$el.addClass('focused');

        // Set highest z-index
        if (!this.focused) {
            let highest = 1;

            this.$el.siblings().each((key, el) => {
                let zIndex = parseInt(el.style.zIndex, 10);

                if (zIndex > highest)
                    highest = zIndex;
            });

            this.$el.css('z-index', highest + 1);
        }

        this.focused = true;
    }

    public setBlurred() {
        if (!this.focused)
            return;

        this.focused = false;
        this.$el.removeClass('focused')
    }

    public setSize(width?: number|string, height?: number|string) {
        this.$el.width(width);
        this.$el.height(height);

        this.chart.reflow();
    }

    public setPosition(top: number|string, left: number|string) {
        this._elementRef.nativeElement.style.transform = `translate(${left}px, ${top}px)`;
        this._elementRef.nativeElement.setAttribute('data-x', left);
        this._elementRef.nativeElement.setAttribute('data-y', top);
    }

    public clearPosition() {
        this.$el.attr('data-o-style', this.$el[0].style.cssText);

        this.$el.css({top: 0, left: 0, bottom: 0, transform: 'none'});
    }

    public restorePosition() {
        let old = this.$el.attr('data-o-style');

        if (old)
            this.$el[0].style.cssText = old;

        this.chart.reflow();
    }

    private _createChart() {
        // Clone a new settings object
        let settings = _.cloneDeep(ThemeDefault);

        // create the chart
        this.chart = HighStock.stockChart(this.$elChart[0], settings);

        // Append optional className
        this.$el.find('.chart').addClass(this.options.className);

        // Focused state
        this.$el.on('mousedown', () => {
            this.focus.emit({state: true, id: this.options.id});
        });
    }

    private _load(from?, until?) {
        from = moment(new Date()).subtract(7, 'days').valueOf();
        until = Date.now();

        let startTime = Date.now();

        this.socket.emit('instrument:read', {
            id: this.options.id,
            count: 300,
            until: until,
            from: from
        }, data => {
            console.info(`Loading ${this.options.instrument} took: ${(Date.now() - startTime) / 1000} Seconds`);

            this.update(data);

            this.socket.emit('instrument:get-data', {
                id: this.options.id,
                count: data.length
            }, (err, data) => {
                if (err)
                    return alert('Error!' + err);

                this.updateIndicators(data);
            });
        });
    }

    public update(_data:any[] = []) {
        // Hide loading screen
        // TODO: Dirty
        this.$elLoadingOverlay.addClass('fade-out');
        setTimeout(() => {
            this.$elLoadingOverlay.remove();
        }, 400);

        if (!_data || !_data.length)
            return;

        let data = ChartComponent.prepareData(_data),
            last = data.candles[data.candles.length-1];

        this.chart.series[0].setData(data.candles);
        this.chart.xAxis[0].setExtremes(data.candles[data.candles.length-100][0], data.candles[data.candles.length-1][0]);

        this.chart.series[1].setData(data.volume);

        this.setCurrentPricePlot(last);
    }

    private setCurrentPricePlot(bar) {
        this.chart.yAxis[0].removePlotLine('current-price');

        this.chart.yAxis[0].addPlotLine({
            value: bar[1],
            color: '#939293',
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

            this.socket.emit('instrument:indicator:add', {id: this.options.id, name: name, options: indicatorModel.inputs, readCount: length, shift: 0}, (err, data) => {
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
                      resolve(false)
                }
            });
        });
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

    _setFakeIntervalUpdate() {
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

    private _createOnServer(instrumentSettings): Promise<InstrumentSettings> {

        return new Promise((resolve, reject) => {

            this._socketService.socket.emit('instrument:create', {
                instrument: instrumentSettings.instrument,
                timeFrame: instrumentSettings.timeFrame,
                //start: start
            }, (err, instrumentSettings:InstrumentSettings) => {
                if (err)
                    return reject(err);

                resolve(instrumentSettings);
            });
        });
    }

    private _destroyOnServer() {
        return new Promise((resolve, reject) => {

            this._socketService.socket.emit('instrument:destroy', {id: this.options.id}, err => {
                if (err)
                    return reject(err);

                resolve();
            });
        });
    }

    private _setUIHandles() {

        interact(this.$el[0])
            .draggable({
                // enable inertial throwing
                inertia: true,
                // keep the element within the area of it's parent
                restrict: {
                    restriction: "parent",
                    endOnly: false,
                    elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
                },
                // enable autoScroll
                //autoScroll: true,

                // call this function on every dragmove event
                onmove: (event) => {
                    event.preventDefault();

                    if (this.tiled) {
                        this.tiled = false;
                        event.currentTarget.className += ' box-shadow';
                    }

                    var target = event.target,
                        // keep the dragged position in the data-x/data-y attributes
                        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    // translate the element
                    target.style.webkitTransform =
                        target.style.transform =
                            'translate(' + x + 'px, ' + y + 'px)';

                    // update the posiion attributes
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            })
            .resizable({
                preserveAspectRatio: false,
                edges: { left: true, right: true, bottom: true, top: true },
                min: 100,
                onend: () => {
                    requestAnimationFrame(() => {
                        this.chart.reflow();
                    });
                },
                restrict: {
                    restriction: "parent"
                },
            })
            .on('resizemove', function (event) {

                event.preventDefault();

                var target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0),
                    y = (parseFloat(target.getAttribute('data-y')) || 0);

                if (event.rect.height < 100 || event.rect.width < 300)
                    return;

                // update the element's style
                target.style.width  = event.rect.width + 'px';
                target.style.height = event.rect.height + 'px';

                // translate when resizing from top or left edges
                x += event.deltaRect.left;
                y += event.deltaRect.top;

                target.style.webkitTransform = target.style.transform =
                    'translate(' + x + 'px,' + y + 'px)';

                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            })
            .actionChecker((pointer, event, action, interactable, element) => {
                // Only listen to left mouse button
                if (event.button !== 0)
                    return null;

                if (action.name === 'resize')
                    return action;

                if (action.name === 'drag') {
                    if (pointer.srcElement.hasAttribute('data-drag-handle'))
                        return action;

                    return null
                }
            });
    }

    async ngOnDestroy() {
        //await this._destroyOnServer();
    }
}