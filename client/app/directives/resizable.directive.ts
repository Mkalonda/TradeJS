import {Directive, ElementRef, Output, EventEmitter, Input, AfterViewInit} from '@angular/core';

const interact = require('interactjs');

@Directive({
	selector: '[resizable]',
	exportAs: 'resizable'
})

export class ResizableDirective implements AfterViewInit {

	@Output() resized: EventEmitter<string> = new EventEmitter();
	@Output() onBeforeResize: EventEmitter<string> = new EventEmitter();
	@Output() onAfterResize: EventEmitter<string> = new EventEmitter();

	@Output() changed = new EventEmitter();

	@Input() _resizeHandle: HTMLElement;
	@Input() bindParent = true;

	private _rootEl;

	constructor(private _elementRef: ElementRef) {
	}

	ngAfterViewInit() {
		this._rootEl = this._elementRef.nativeElement;

		if (this.bindParent)
			this._rootEl = this._rootEl.parentNode;

		this._setUIHandles();
	}

	private _setUIHandles() {

		interact(this._rootEl)
			.resizable({
				preserveAspectRatio: false,
				edges: {left: true, right: true, bottom: true, top: true},
				min: 100,
				restrict: {
					restriction: 'parent'
				},
				onstart: (event) => {
					this.onBeforeResize.emit(event.interaction.prepared.edges);
				},
				onmove: (event) => {
					event.preventDefault();

					if (event.currentTarget !== this._resizeHandle)
						return;

					if (event.rect.height < 100 || event.rect.width < 300)
						return;

					let target = event.target,
						x = (parseFloat(target.getAttribute('data-x')) || 0),
						y = (parseFloat(target.getAttribute('data-y')) || 0);

					if (event.rect.height < 100 || event.rect.width < 300)
						return;

					// update the element's style
					target.style.width = event.rect.width + 'px';
					target.style.height = event.rect.height + 'px';

					// translate when resizing from top or left edges
					x += event.deltaRect.left;
					y += event.deltaRect.top;

					target.style.webkitTransform = target.style.transform =
						'translate(' + x + 'px,' + y + 'px)';

					target.setAttribute('data-x', x);
					target.setAttribute('data-y', y);
				},
				onend: () => {
					this.onAfterResize.emit();
					this.changed.emit();
				}
			});
		// .allowFrom(this._elementRef.nativeElement);
		// .actionChecker((pointer, event, action, interactable, element) => {
		//     // Only listen to left mouse button
		//     if (action.name === 'resize' && event.button === 0)
		//         return action;
		//
		//     console.log(action.name);
		// });
	}
}