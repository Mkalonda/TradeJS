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

    create(modalComponent: any, options = <any>{}): ComponentRef<ModalComponent> {
        this.viewContainer.clear();

        let modalComponentFactory = this.componentFactoryResolver.resolveComponentFactory(modalComponent);
        let modalComponentRef = <any>this.viewContainer.createComponent(modalComponentFactory);

        modalComponentRef.instance.options = options;

        modalComponentRef.changeDetectorRef.detectChanges();

        $(modalComponentRef._nativeElement.firstElementChild).modal('show');

        return modalComponentRef;
    }

    destroy(modalComponentRef) {
        let $el = $(modalComponentRef._nativeElement.firstElementChild);

        $el.on('hidden.bs.modal', function() {
            modalComponentRef.destroy();
        }).modal('hide');
    }
}