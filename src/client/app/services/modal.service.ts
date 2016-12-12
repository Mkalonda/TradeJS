import { Injectable } from '@angular/core';
import {ModalAnchorDirective} from "../directives/modalanchor.directive";

interface IModal {
    showClose?: boolean,
    model?: any;
}

@Injectable()
export default class ModalService {

    public directive: ModalAnchorDirective = null;


    //
    constructor() {}

    //
    init() {

    }

    create(Component: any, options?:any) {
        return this.directive.createModal(Component, options);
    }
}