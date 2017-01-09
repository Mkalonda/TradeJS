import {Directive, ComponentFactoryResolver, ComponentRef, EventEmitter, Output} from '@angular/core';

import {ViewContainerRef} from '@angular/core';
import {ChartComponent} from "../common/chart/chart.component";

@Directive({
    selector: '[chartsAnchor]'
})
export class ChartsAnchorDirective {

    @Output() public focus = new EventEmitter();
    @Output() public resize = new EventEmitter();

    public charts: Array<ComponentRef<ChartComponent>> = [];

    constructor(
        private _viewContainer: ViewContainerRef,
        private _componentFactoryResolver: ComponentFactoryResolver
    ) {}

    add(options = <any>{}): ComponentRef<ChartComponent> {
        let chartComponentFactory = this._componentFactoryResolver.resolveComponentFactory(ChartComponent);
        let chartComponentRef = this._viewContainer.createComponent(chartComponentFactory);

        chartComponentRef.instance.options = options;

        chartComponentRef.changeDetectorRef.detectChanges();

        chartComponentRef.instance.focus.subscribe((params) => {
            this.focus.emit(params);
        });

        chartComponentRef.instance.resize.subscribe((params) => {
            this.resize.emit(params);
        });

        chartComponentRef.instance.close.subscribe(() => {

            chartComponentRef.instance.resize.unsubscribe();
            chartComponentRef.instance.close.unsubscribe();

            chartComponentRef.destroy();

            this.charts.splice(this.charts.indexOf(chartComponentRef), 1);
        });

        this.charts.push(chartComponentRef);

        return chartComponentRef;
    }
    
    clear() {
        this._viewContainer.clear();
    }

    getChartById(id): ComponentRef<ChartComponent> {
        let charts = this.charts,
            i = 0, len = charts.length;

        for (; i < len; i++)
            if (charts[i].instance.options.id === id)
                return charts[i];

        return null;
    }
}