import { Injectable }   from '@angular/core';
import * as SYSTEM      from '../../../shared/constants/system';


@Injectable()
export class ConstantsService {

    public constants: any;

    constructor() {}

    init() {
        this.constants = SYSTEM;
    }
}