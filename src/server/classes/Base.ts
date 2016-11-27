import {EventEmitter} from 'events';

export default class Base extends EventEmitter {

    constructor(protected opt:any = <any>{}) {
        super();
    }

    public async init() {}
}
