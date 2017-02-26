import {Directive, ElementRef, OnInit, Input} from '@angular/core';

const interact = require('interactjs');

@Directive({
    selector: '[draggable]'
})

export class DraggableDirective implements OnInit {

    @Input()
    private _dragHandle: HTMLElement;

    @Input() restrict = true;
    @Input() direction = 'xy';
    @Input() onDrag: any = null;

    constructor(private _elementRef: ElementRef) {
    }

    ngOnInit() {
        this._setUIHandles();
    }

    /**
     * Node: InteractJS (1.2.8) does not allow multiple 'allowFrom' functions, so workaround is applied.
     *
     * @private
     */
    private _setUIHandles() {

        // temp
        this._dragHandle = this._elementRef.nativeElement.querySelector('[data-drag-handle]') || this._elementRef.nativeElement;

        interact(this._dragHandle)
            .draggable({
                // enable inertial throwing
                inertia: true,
                // keep the element within the area of it's parent
                restrict: {
                    restriction: this.restrict ? this._elementRef.nativeElement.parentNode : false,
                    endOnly: false,
                    elementRect: {top: 0, left: 0, bottom: 1, right: 1}
                },

                // call this function on every dragmove event
                onmove:  this.onDrag || ((event) => {
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
                })
            });
    }
}