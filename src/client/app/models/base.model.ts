import {EventEmitter, Output} from "@angular/core";

export class BaseModel {

    @Output()
    public changed = new EventEmitter();

    public data = {};

    public set(obj) {
        Object.assign(this.data, obj);
        this.changed.next();
    }

    public toJson() {
        return JSON.stringify(this.data);
    }
}