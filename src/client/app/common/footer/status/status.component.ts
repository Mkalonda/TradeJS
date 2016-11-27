import {Component, OnInit}  from '@angular/core';
import {SystemService}      from "../../../services/system.service";
import * as SYSTEM          from '../../../../../shared/constants/system';
import {ConstantsService}   from "../../../services/constants.service";

@Component({
    selector: 'status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss']
})

export default class StatusComponent {

    protected constants;

    constructor(
        protected systemService: SystemService,
        protected constantsService: ConstantsService
    ) {}
}