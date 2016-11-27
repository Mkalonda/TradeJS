declare var clearTimeout: any;

import Base from '../Base';

const debug = require('debug')('TradeJS:IPC');

export default class IPC extends Base {

    id: string|number;
    env: string;
    sockets: any = {};

    private _unique: number = 0;
    private _ipc: any = null;
    private _acks: any = {};

    constructor(protected opt) {
        super(opt);

        this.id = this.opt.id;
        this.env = this._getEnvironment();
    }

    /**
     *
     * @returns {Promise.<TResult>|*}
     */
    init() {
        return super
            .init()
            .then(() => {
                if (this.env === 'node')
                    return this._setConfigNode();
            });
    }

    /**
     *
     * @returns {Promise}
     */
    startServer() {
        debug(`${this.id} is starting ${this.env} server`);

        if (this.env === 'node') {
            return this._startServerNode();
        } else {

        }
    }

    /**
     *
     * @param workerId {string}
     * @returns {Promise}
     */
    connectTo(workerId) {
        debug(`${this.id} is connecting to ${workerId}`);

        if (this.env === 'node') {
            return this._connectToNode(workerId);
        } else {

        }
    }

    send(workerId:string, eventName:string, data:any = {}, waitForCallback:boolean = true) {

        return new Promise((resolve, reject) => {

            let socket      = this._ipc.of[workerId] || this._ipc.server.of[workerId],
            //let socket      = this.sockets[workerId],
                cbTimeout   = 60000,
                _data = <any>{
                    type: eventName,
                    id: this.id,
                    data: data
                };

            if (!socket)
                return reject('Socket does not exist! ' + workerId);

            // Continue when waitForCallback is ack string OR true
            if (waitForCallback) {

                // Set a new callback listener
                if (waitForCallback === true) {
                    let ack = _data.ack = <number>this.id + ++this._unique;

                    let t = setTimeout(() => {
                            delete this._acks[ack];
                            reject(`Event [${eventName}] to [${workerId}] did not respond in time`);
                        }, cbTimeout),
                        cb = returnData => {
                            clearTimeout(t);
                            resolve(returnData);
                        };

                    this._acks[ack] = cb;
                }
                // This is a callback response, set the callback string as function;
                else {
                    _data.ack = waitForCallback;
                }
            }

            socket.emit('message', _data);

            if (!waitForCallback)
                resolve();
        });
    }

    /**
     *
     * @private
     */
    _setConfigNode() {
        this._ipc = require('node-ipc');

        this._ipc.config.id                 = this.id;
        this._ipc.config.retry              = 1500;
        this._ipc.config.silent             = true;
        this._ipc.config.logInColor         = false;
        this._ipc.config.requiresHandshake  = true;
    }

    /**
     *
     * @returns {Promise}
     * @private
     */
    _startServerNode() {
        return new Promise((resolve, reject) => {

            this._ipc.serve(() => {

                this._ipc.server.on('connect', (socket) => {
                    this.sockets[socket.id] = socket;
                });

                this._ipc.server.on('message', (data, socket) => {
                    this._onMessage(data);
                });

                this._ipc.server.on('socket.disconnected', (socket, destroyedSocketID) => {
                    this._ipc.log('client ' + destroyedSocketID + ' has disconnected!');
                });
            });

            this._ipc.server.on('start', resolve);
            (<any>this._ipc.server).start();
        });
    }

    /**
     *
     * @param workerID {string}
     * @returns {Promise}
     * @private
     */
    _connectToNode(workerId) {

        return new Promise((resolve, reject) => {

            this._ipc.connectTo(workerId, () => {
                let socket = this._ipc.of[workerId];

                this.sockets[workerId] = socket;

                socket.on('connect', () => {
                    debug(`${this.id} connected to ${workerId}`);
                    resolve();
                });

                socket.on('disconnect', () => {
                    debug(`${this.id} disconnected from ${workerId}`);
                });

                socket.on('error', err => {
                    debug(`${this.id} error`, err);
                    reject(err);
                });

                socket.on('message', (data, socket) => {
                    this._onMessage(data)
                });
            });
        });
    }

    /**
     * If there is a cb stored for the function, it means the next one should not get a callback function
     *
     * @param data
     * @private
     */
    _onMessage(data) {
        if (this._acks[data.ack]) {
            this._acks[data.ack](data.data);
            delete this._acks[data.ack];
            return;
        }

        let cb;

        if (data.ack) {
            cb = (err, returnData) => {

                if (err)
                    return console.error(err);

                // // Convert typed Array to normal array
                // if (returnData && returnData.buffer && returnData.buffer instanceof ArrayBuffer) {
                //     returnData = Array.from(returnData);
                // }

                this.send(data.id, data.type, returnData, data.ack).catch(console.error);
            }
        }

        this.emit(data.type, data.data, cb)
    }

    /**
     *
     * @returns {string}
     * @private
     */
    _getEnvironment() {
        return typeof window == 'undefined' ? 'node' : 'browser';
    }
}

