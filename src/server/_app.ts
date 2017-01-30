require('source-map-support').install({handleUncaughtExceptions: true});
import './util/more-info-console';

import Socket = SocketIO.Socket;

import * as io              from 'socket.io';
import * as cors            from 'cors';
import * as http            from "http";
import {json, urlencoded}   from 'body-parser';
import * as path            from 'path';
import * as freePort        from 'freeport';

import Base                 from './classes/Base';
import IPC                  from './classes/ipc/IPC';

import CacheController      from './controllers/CacheController';
import SystemController     from './controllers/SystemController';
import InstrumentController from './controllers/InstrumentController';
import EditorController     from './controllers/EditorController';
import ConfigController     from './controllers/ConfigController';
import BrokerController     from "./controllers/BrokerController";


const morgan = require('morgan');
const express: any = require('express');

const
    debug = require('debug')('TradeJS:App'),

    DEFAULT_TIMEZONE = 'America/New_York',
    PATH_PUBLIC_DEV = path.join(__dirname, '../client'),
    PATH_PUBLIC_PROD = path.join(__dirname, '../client');

/**
 * @class App
 */
export default class App extends Base {

    public controllers: {
        config?: ConfigController,
        system?: SystemController,
        broker?: BrokerController,
        cache?: CacheController,
        editor?: EditorController,
        instrument?: InstrumentController
    } = {};

    private _ipc: IPC = new IPC({id: 'main'});
    private _http: any = null;
    private _io: any = null;
    private _httpApi: any = null;

    public get ipc() {
        return this._ipc;
    }

    public async init(): Promise<any> {
        // Make sure the app can be cleaned up on termination
        this._setProcessListeners();

        // Initialize ConfigController to build config object used throughout app
        this.controllers.config = new ConfigController(this.opt, this);
        let config = await this.controllers.config.init();

        // Set timezone
        await this._setTimezone(config.system.timezone);

        // Create IPC hub
        await this._initIPC();

        // Create app controllers
        this.controllers.system = new SystemController({}, this);
        this.controllers.broker = new BrokerController({}, this);
        this.controllers.cache = new CacheController({path: config.path.cache}, this);
        this.controllers.editor = new EditorController({path: config.path.custom}, this);
        this.controllers.instrument = new InstrumentController({}, this);

        // Initialize controllers
        await this.controllers.system.init();
        await this.controllers.broker.init();
        await this.controllers.cache.init();
        await this.controllers.instrument.init();
        await this.controllers.editor.init();

        // Start public API so client can follow booting process
        await this._initAPI();

        this.controllers.system.update({booting: false});

        this.emit('app:ready');
    }

    public debug(type: string, text: string, data?: Object, socket?: Socket): void {
        let date = new Date();

        if (type === 'error')
            console.warn('ERROR', text);

        if (!this._io || !this._io.sockets || !this._io.sockets.length)
            return;

        socket = socket || this._io.sockets;

        (socket || this._io.sockets).emit('debug', {
            time: date.getTime(),
            timePretty: date,
            type: type,
            text: text,
            data: data
        });
    }

    private async _initIPC() {
        await this._ipc.init();
        await this._ipc.startServer();
    }

    /**
     *
     * @private
     */
    private _initAPI() {

        return new Promise(async(resolve, reject) => {
            debug('Starting API');

            let port = this.controllers.config.get().system.port;

            this._httpApi = express();
            this._http = http.createServer(this._httpApi);
            this._io = io.listen(this._http);

            this._httpApi.use(cors({origin: 'http://localhost:4200'}));
            this._httpApi.use(express.static(process.env.NODE_ENV === 'production' ? PATH_PUBLIC_PROD : PATH_PUBLIC_DEV));

            this._httpApi.use(json());
            this._httpApi.use(urlencoded({extended: true}));

            // Index root
            this._httpApi.get('/', (req, res) => {
                console.log('asdasdasdasd', path.join(__dirname, '../client/index.html'));

                res.sendFile(path.join(__dirname, '../client/index.html'));
            });

            // Authentication routes
            this._httpApi.use('/', require('./api/http/auth')(this));

            // Application routes
            this._io.on('connection', socket => {
                debug('a websocket connected');

                require('./api/socket/system')(this, socket);
                require('./api/socket/editor')(this, socket);
                require('./api/socket/backtest')(this, socket);
                require('./api/socket/instrument')(this, socket);

                socket.emit('system:state', this.controllers.system.state);

                this.debug('info', 'Connected to server');
            });

            this._http.listen(port, () => {
                console.log(`\n\n\n  REST API started on localhost:${port} \n\n\n`);

                this.debug('info', 'Public API started');

                resolve();
            });

            /**
             * Server events
             */
            this.controllers.system.on('change', state => {
                this._io.sockets.emit('system:state', state);
            });

            this.controllers.instrument.on('created', instrument => {
                this._io.sockets.emit('instrument:created', {
                    id: instrument.id,
                    timeFrame: instrument.timeFrame,
                    instrument: instrument.instrument
                });
            });
        });
    }

    private _getFreePort() {
        return new Promise((resolve, reject) => {
            freePort(function (err, port) {
                if (err) reject(err);
                resolve(port);
            });
        });

    }

    private _setTimezone(timeZone) {
        return new Promise((resolve, reject) => {
            process.env.TZ = timeZone || DEFAULT_TIMEZONE;
            resolve();
        });
    }

    private _setProcessListeners() {

        const processExitHandler = error => {
            this.destroy().then(() => process.exit(0)).catch(console.error)
        };

        process.on("SIGTERM", processExitHandler);
        process.on("SIGINT", processExitHandler);
        process.on("unhandledRejection", error => {
            console.log("!unhandledRejection");
            console.error(error);
        });
    }

    private async _killAllChildProcesses() {
        await this.controllers.instrument.destroyAll();
        await this.controllers.cache.destroy();
    }

    async destroy(): Promise<any> {
        debug('Shutting down and cleaning up child processes');
        this.debug('warning', 'Shutting down server');

        await this._killAllChildProcesses();

        //this._httpApi.close();
        this._httpApi = null;
        this._http = null;
        this._io = null;

        return;
    }
}
