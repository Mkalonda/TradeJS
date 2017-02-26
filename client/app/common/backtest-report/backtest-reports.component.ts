import {Component, AfterViewInit, ElementRef, Input} from '@angular/core';

@Component({
    selector: 'backtest-reports',
    templateUrl: './backtest-reports.component.html',
    styleUrls: ['./backtest-reports.component.scss']
})

export class BacktestReportsComponent implements AfterViewInit {

    @Input() report = null;

    public loading = false;

    constructor(private elementRef: ElementRef) {
    }

    ngAfterViewInit(): void {

    }

    toggleLoading(state: boolean) {
        this.loading = state;

        if (state)
            this.clear();
    }

    clear() {
        this.report = null;
    }
}