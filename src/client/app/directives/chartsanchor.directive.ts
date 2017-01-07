import {Directive, ComponentFactoryResolver, ComponentRef} from '@angular/core';

import {ViewContainerRef} from '@angular/core';
import {ChartComponent} from "../common/chart/chart.component";

@Directive({
    selector: '[chartsAnchor]'
})
export class ChartsAnchorDirective {

    constructor(
        private _viewContainer: ViewContainerRef,
        private _componentFactoryResolver: ComponentFactoryResolver
    ) {}

    add(options = <any>{}): ComponentRef<ChartComponent> {
        let chartComponentFactory = this._componentFactoryResolver.resolveComponentFactory(ChartComponent);
        let chartComponentRef = this._viewContainer.createComponent(chartComponentFactory);

        chartComponentRef.instance.options = options;

        chartComponentRef.changeDetectorRef.detectChanges();

        chartComponentRef.instance.close.subscribe(() => {
            chartComponentRef.destroy();
        });

        return chartComponentRef;
    }
    
    clear() {
        this._viewContainer.clear();
    }
}