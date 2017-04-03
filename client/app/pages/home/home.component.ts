declare var $: any;

import {Component, OnInit} from '@angular/core';
import 'jquery-resizable-dom';

@Component({
	selector: 'page-home',
	templateUrl: './home.component.html',
	styleUrls: ['../../common/css/three-column.css', './home.component.scss']
})

export class HomeComponent implements OnInit {

<<<<<<< HEAD
    ngOnInit() {}

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

=======
	constructor(private _elementRef: ElementRef) {
	}

	onDrag(event) {

		console.log(event);
		// event.preventDefault();
		console.log(this._elementRef);
		let target = this._elementRef.nativeElement;
		console.log('test3');
		let // keep the dragged position in the data-x/data-y attributes
			x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
			y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		// translate the element
		target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

		// update the posiion attributes
		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	}
}
>>>>>>> 784a82e798e70bb24aeaf84ac97f7506bcf607b5
