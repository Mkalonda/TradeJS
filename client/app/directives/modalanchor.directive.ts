import {Directive, ComponentFactoryResolver, ComponentRef} from '@angular/core';

import {ViewContainerRef} from '@angular/core';
import {ModalComponent} from '../common/modal/modal.component';
import ModalService from '../services/modal.service';

declare let $: any;

@Directive({
    selector: '[modalAnchor]'
})

export class ModalAnchorDirective {
    
    public modalComponentRef;

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
        this.modalComponentRef = <any>this.viewContainer.createComponent(modalComponentFactory);

        this.modalComponentRef.instance.options = options;

        this.modalComponentRef.changeDetectorRef.detectChanges();

        this.show();

        return this.modalComponentRef;
    }

    show() {
        $(this.modalComponentRef.instance.elementRef.nativeElement.firstElementChild).modal('show');
    }

    hide() {

    }

    destroy(modalComponentRef) {
        let $el = $(modalComponentRef._nativeElement.firstElementChild);

        $el.on('hidden.bs.modal', function() {
            modalComponentRef.destroy();
        }).modal('hide');
    }
}
