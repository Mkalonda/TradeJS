import Socket = SocketIO.Socket;

require('source-map-support').install({
    handleUncaughtExceptions: true
});

process.on("unhandledRejection", function (error) {
    console.log("!unhandledRejection");
    console.error(error);
});

import './util/more-info-console';

import * as _               from 'lodash';
import * as io              from 'socket.io';
import * as cors            from 'cors';
import * as http            from "http";
import {json, urlencoded}   from 'body-parser';
import * as path            from 'path';
import * as freePort        from 'freeport';

import Base                 from './classes/Base';
import IPC                  from './classes/ipc/IPC';

import CacheController from './controllers/CacheController';
import SystemController from './controllers/SystemController';
import InstrumentController from './controllers/InstrumentController';
import EditorController from './controllers/EditorController';
import ConfigController from './controllers/ConfigController';
import BrokerController from "./controllers/BrokerController";

const morgan = require('morgan');
const express: any = require('express');

const
    debug = require('debug')('TradeJS:App'),

    DEFAULT_TIMEZONE = 'America/New_York',
    PATH_PUBLIC_DEV = path.join(__dirname, '../assets'),
    PATH_PUBLIC_PROD = path.join(__dirname, './assets');

/**
 * @class App
 */
export default class App extends Base {

    public controllers: {
        config: ConfigController,
        system: SystemController,
        broker: BrokerController,
        cache: CacheController,
        editor: EditorController,
        instrument: InstrumentController
    } = <any>{};

    public settings: any;

    electron = {
        init: false,
        path: null
    };

    _ipc: IPC = new IPC({id: 'main'});
    _http: any = null;
    _io: any = null;
    _httpApi: any = null;

    async init() {
        // the config controller is needed as first, as it gets the settings for other controllers
        this.controllers.config = new ConfigController({}, this);

        // Set merged config as settings
        this.settings = await this.controllers.config.set(this.opt);

        await this._setTimezone(this.opt.timezone);
        await this._initAPI();
        await this._initIPC();
        await this._initControllers();

        this.debug('info', 'Public API started');

        this.emit('app:ready');
        process && process.send && process.send('app:ready');
    }

    /**
     *
     * @private
     */
    async _initIPC() {
        await this._ipc.init();
        await this._ipc.startServer();
    }

    /**
     *
     * @returns {*}
     * @private
     */
    async _initControllers() {
        this.controllers.system = new SystemController({}, this);
        this.controllers.broker = new BrokerController({}, this);
        this.controllers.cache  = new CacheController({path: this.opt.path.cache}, this);
        this.controllers.editor = new EditorController({path: this.opt.path.custom}, this);
        this.controllers.instrument = new InstrumentController({}, this);

        await Promise.all(_.map(this.controllers, (c:any, name:string) => name !== 'config' && c.init()));
    }

    /**
     *
     * @private
     */
    _initAPI() {

        return new Promise(async (resolve, reject) => {
            debug('Starting API');

            this.opt.port   = this.opt.port || await this._getFreePort();

            this._httpApi   = express();
            this._http      = http.createServer(this._httpApi);
            this._io        = io.listen(this._http);

            this._httpApi.use(cors({origin: 'http://localhost:4200'}));

            this._httpApi.use(express.static(process.env.NODE_ENV === 'production' ? PATH_PUBLIC_PROD : PATH_PUBLIC_DEV));

            this._httpApi.use(json());
            this._httpApi.use(urlencoded({extended: true}));

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

                this.debug('info', 'Successfully connected to server');
            });

            this._http.listen(this.settings.system.port, () => {
                console.log(`\n\n\n  API started on localhost:${this.settings.system.port} \n\n\n`);
                resolve();
            });
        });
    }

    _getFreePort() {
        return new Promise((resolve, reject) => {
            freePort(function(err, port) {
                if (err) reject(err);
                resolve(port);
            });
        });

    }

    _setTimezone(timeZone) {
        return new Promise((resolve, reject) => {
            process.env.TZ = timeZone || DEFAULT_TIMEZONE;
            resolve();
        });
    }

    _setElectron(electron) {
        this.electron = electron;
    }

    debug(type: string, text: string, data?: Object, socket?: Socket) {
        let date = new Date();

        (socket || this._io.sockets).emit('debug', {
            time: date.getTime(),
            timePretty: date,
            type: type,
            text: text,
            data: data
        })
    }

    destroy() {
        this._httpApi.close();
        this._httpApi = null;
        this._http = null;
        this._io = null;
    }
}
