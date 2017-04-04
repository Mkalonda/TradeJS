declare var $: any;

import {Component, OnInit} from '@angular/core';
import 'jquery-resizable-dom';

@Component({
	selector: 'page-home',
	templateUrl: './home.component.html',
	styleUrls: ['../../common/css/three-column.css', './home.component.scss']
})

export class HomeComponent implements OnInit {

	ngOnInit() {
	}

	onDrag(event) {
		event.preventDefault();

		let target = event.target,
			x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;

		// translate the element
		target.style.webkitTransform = target.style.transform = 'translateX(' + x + 'px)';

		// update the position attributes
		target.setAttribute('data-x', x);
	}
}