import EventEmitter = NodeJS.EventEmitter;

export class SyncModel extends EventEmitter {

    constructor(
        protected data = {},
        protected url?: string,
        private _socket?: any) {
        super();
    }

    public set(obj, triggerChange = true): void {
        if (typeof obj !== 'object')
            return;

        Object.assign(this.data, obj);

        if (triggerChange)
            this.emit('changed');

        this.sync();
    }

    public toJson(): string {
        return JSON.stringify(this.data);
    }

    public sync(): void {
        this._socket.emit(this.url, this.data);
    }
}