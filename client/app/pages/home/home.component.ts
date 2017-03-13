import {Component, ElementRef} from '@angular/core';

@Component({
    selector: 'page-home',
    templateUrl: './home.component.html',
    styleUrls: ['../../common/css/three-column.css', './home.component.scss']
})

export class HomeComponent {

    constructor(
        private _elementRef: ElementRef
    ) {}

    onDrag(event) {
        event.preventDefault();

        let target = this._elementRef.nativeElement;

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