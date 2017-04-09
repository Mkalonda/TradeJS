import {EventEmitter, Output} from '@angular/core';

export class BaseModel {

	@Output()
	public changed = new EventEmitter();
	public data = {};

	public set(obj, triggerChange = true) {
		if (typeof obj !== 'object')
			return;

		Object.assign(this.data, obj);

		if (triggerChange)
			this.changed.next();
	}

	public toJson() {
		return JSON.stringify(this.data);
	}

	public sync() {

	}
}