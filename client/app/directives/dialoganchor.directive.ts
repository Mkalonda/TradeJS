import {Directive, ComponentFactoryResolver, ComponentRef} from '@angular/core';

import {ViewContainerRef} from '@angular/core';
import {DialogComponent} from '../common/dialog/dialog.component';

@Directive({
	selector: '[dialogAnchor]'
})

export class DialogAnchorDirective {

	constructor(private viewContainer: ViewContainerRef,
				private componentFactoryResolver: ComponentFactoryResolver) {
	}

	createDialog(dialogComponent: { new(): DialogComponent }, options = <any>{}): ComponentRef<DialogComponent> {
		this.viewContainer.clear();

		let dialogComponentFactory = this.componentFactoryResolver.resolveComponentFactory(dialogComponent);
		let dialogComponentRef = this.viewContainer.createComponent(dialogComponentFactory);

		dialogComponentRef.instance.options = options;
		dialogComponentRef.instance.model = options.model;

		dialogComponentRef.changeDetectorRef.detectChanges();

		dialogComponentRef.instance.close.subscribe(() => {
			dialogComponentRef.destroy();
		});

		return dialogComponentRef;
	}
}