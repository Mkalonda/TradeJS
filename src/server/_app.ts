import Socket = SocketIO.Socket;

require('source-map-support').install({
    handleUncaughtExceptions: true
});

process.on("unhandledRejection", function (error) {
    console.log("!unhandledRejection");
    console.error('ERROR', error);
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

    public controllers = {
        config: new ConfigController(this.opt, this),
        system: new SystemController({}, this),
        broker: new BrokerController({}, this),
        cache: new CacheController({path: this.opt.path.cache}, this),
        editor: new EditorController({path: this.opt.path.custom}, this),
        instrument: new InstrumentController({}, this)
    };

    private _electron = {
        init: false,
        path: null
    };

    private _ipc: IPC = new IPC({id: 'main'});
    private _http: any = null;
    private _io: any = null;
    private _httpApi: any = null;

    async init() {
       return this._boot();
    }

    async _boot() {
        let config;

        // First initialize config controller and set current config
        await this.controllers.config.init();
        config = await this.controllers.config.set(this.opt);

        await this._setTimezone(config.system.timezone);
        await this._initAPI();
        await this._initIPC();

        // Initialize all controllers (config is already initialized)
        await Promise.all(_.map(this.controllers, (c: any, name: string) => name !== 'config' && c.init()));

        // Initial attempt to connect with broker
        await this.controllers.broker.connect(config.account);

        this.emit('app:ready');

        process && process.send && process.send('app:ready');

        this.controllers.system.update({booting: false});
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
     * @private
     */
    _initAPI() {

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

            // Authentication routes
            this._httpApi.use('/', require('./api/http/auth')(this));

            this._httpApi.get('/', (req, res) => {
                console.log(path.join(__dirname, '../client/index.html'));

                res.sendFile(path.join(__dirname, '../client/index.html'));
            });

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

            //
            this.controllers.system.on('change', state => {
                this._io.sockets.emit('system:state', state);
            });

            this._http.listen(port, () => {
                console.log(`\n\n\n  REST API started on localhost:${port} \n\n\n`);

                this.debug('info', 'Public API started');

                resolve();
            });
        });
    }

    _getFreePort() {
        return new Promise((resolve, reject) => {
            freePort(function (err, port) {
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
        this._electron = electron;
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
