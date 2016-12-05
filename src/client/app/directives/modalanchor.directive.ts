import {Directive, ComponentFactoryResolver, ComponentFactory, ComponentRef} from '@angular/core';

import {ViewContainerRef} from '@angular/core';
import {ModalComponent} from '../common/modal/modal.component';

@Directive({
    selector: '[modalAnchor]'
})
export class ModalAnchorDirective {

    constructor(
        private viewContainer: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {}

    createDialog(modalComponent: { new(): ModalComponent }, options = <any>{}): ComponentRef<ModalComponent> {
        this.viewContainer.clear();

        let dialogComponentFactory = this.componentFactoryResolver.resolveComponentFactory(modalComponent);
        let dialogComponentRef = this.viewContainer.createComponent(dialogComponentFactory);

        console.log('dialogComponentRef', dialogComponentRef, options);

        dialogComponentRef.instance.options = options;
        dialogComponentRef.instance.model = options.model;

        dialogComponentRef.changeDetectorRef.detectChanges();

        dialogComponentRef.instance.close.subscribe(() => {
            dialogComponentRef.destroy();
        });

        return dialogComponentRef;
    }
}