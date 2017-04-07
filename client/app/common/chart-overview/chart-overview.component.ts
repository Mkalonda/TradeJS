import {
	Component, OnInit, ElementRef, QueryList, ViewChildren
}  from '@angular/core';

import {InstrumentsService} from '../../services/instruments.service';
import {ChartBoxComponent} from '../chart-box/chart-box.component';
import {InstrumentModel} from '../../models/instrument.model';

@Component({
	selector: 'chart-overview',
	templateUrl: './chart-overview.component.html',
	styleUrls: ['./chart-overview.component.scss'],
	entryComponents: [ChartBoxComponent]
})

export class ChartOverviewComponent implements OnInit {

	@ViewChildren(ChartBoxComponent) charts: QueryList<ChartBoxComponent>;

	constructor(public instrumentsService: InstrumentsService,
				private _elementRef: ElementRef) {
	}

	ngOnInit() {
		this.instrumentsService.instruments$.subscribe(instruments => {
			this.setFocusToHighestIndex();
		});
	}

	tileWindows() {
		let containerH = this._elementRef.nativeElement.firstElementChild.clientHeight,
			containerW = this._elementRef.nativeElement.firstElementChild.clientWidth,
			len = this.charts.length;

		this.charts.forEach((chart, i) => {
			chart.mode = 'windowed';

			chart.$el.removeAttr('style').addClass('animate');

			setTimeout(() => {
				chart.$el.removeClass('animate');
			}, 400);

			if (len < 4) {
				let chartW = Math.floor(containerW / len);
				chart.setSize(chartW, containerH);
				chart.setPosition(0, (i * chartW) + (i * 1));
				return;
			}

			let even = len % 2 === 0;
		});
	}

	toggleFocused(chartComponent) {
		this.charts.forEach(chart => chart.toggleFocus(chart === chartComponent));
	}

	setFocusToHighestIndex(): void {
		if (!this.charts)
			return;

		let highest = 1,
			ref = this.charts.first;

		this.charts.forEach(chart => {
			if (chart.$el[0].style.zIndex > highest)
				ref = chart;
		});

		this.toggleFocused(ref);
	}

	getByHighestIndex(): InstrumentModel {
		return null;
	}
}