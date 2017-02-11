import {EventEmitter}   from 'events';
import * as merge       from 'deepmerge';

export default class Base extends EventEmitter {

    protected options: any = <any>{};

    constructor(protected opt?: any) {
        super();

        // TODO: until opt is fully renamed to 'options' in all classes
        this.options = opt;
    }

    protected updateOptions(options) {
        this.opt = this.options = merge(this.options, options);

    }


    public async init(): Promise<any> {}
}
