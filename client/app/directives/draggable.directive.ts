import {Directive, ElementRef, Input, Output, EventEmitter, AfterViewInit} from '@angular/core';

const interact = require('interactjs');

@Directive({
	selector: '[draggable]',
	exportAs: 'draggable'
})

export class DraggableDirective implements AfterViewInit {

	@Input() _dragHandle: HTMLElement;

	@Input() restrict = true;
	@Input() direction = 'xy';
	@Input() onDrag: any = null;
	@Input() bindParent = true;

	@Output() changed = new EventEmitter();


	private _rootEl;

	constructor(private _elementRef: ElementRef) {
	}

	ngAfterViewInit() {
		this._rootEl = this._elementRef.nativeElement;

		if (this.bindParent)
			this._rootEl = this._rootEl.parentNode;

		this._setUIHandles();
	}

	/**
	 * Node: InteractJS (1.2.8) does not allow multiple 'allowFrom' functions, so workaround is applied.
	 *
	 * @private
	 */
	private _setUIHandles() {

		// temp
		this._dragHandle = this._rootEl.querySelector('[data-drag-handle]') || this._elementRef.nativeElement;

		interact(this._dragHandle)
			.draggable({
				// enable inertial throwing
				inertia: true,
				// keep the element within the area of it's parent
				restrict: {
					restriction: this.restrict ? this._rootEl.parentNode : false,
					endOnly: false,
					elementRect: {top: 0, left: 0, bottom: 1, right: 1}
				},

				// call this function on every dragmove event
				onmove: this.onDrag || ((event) => {
					event.preventDefault();

					let target = this._rootEl;

					let // keep the dragged position in the data-x/data-y attributes
						x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
						y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

					// translate the element
					target.style.webkitTransform = target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

					// update the posiion attributes
					target.setAttribute('data-x', x);
					target.setAttribute('data-y', y);
				}),
				onend: () => {
					this.changed.emit();
				},
			});
	}
}