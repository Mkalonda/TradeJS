import {Directive, ComponentFactoryResolver, ComponentFactory, ComponentRef} from '@angular/core';

import {ViewContainerRef} from '@angular/core';
import {ModalComponent} from '../common/modal/modal.component';
import ModalService from "../services/modal.service";

declare var $: any;

@Directive({
    selector: '[modalAnchor]'
})

export class ModalAnchorDirective {

    constructor(
        private viewContainer: ViewContainerRef,
        private componentFactoryResolver: ComponentFactoryResolver,
        private _modalService: ModalService
    ) {
        _modalService.directive = this;
    }

    createModal(modalComponent: any, options = <any>{}): ComponentRef<ModalComponent> {
        this.viewContainer.clear();

        let modalComponentFactory = this.componentFactoryResolver.resolveComponentFactory(modalComponent);
        let modalComponentRef = <any>this.viewContainer.createComponent(modalComponentFactory);

        console.log('modalComponentRef', modalComponentRef, options);

        modalComponentRef.instance.options = options;

        modalComponentRef.changeDetectorRef.detectChanges();
        console.log('asfasdsdfsdfd', modalComponentRef._nativeElement);
        $(modalComponentRef._nativeElement.firstElementChild).modal('show');

        // modalComponentRef.instance.close.subscribe(() => {
        //     modalComponentRef.destroy();
        // });

        return modalComponentRef;
    }
}