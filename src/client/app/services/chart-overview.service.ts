import * as moment from 'moment/moment';

import {Injectable} from "@angular/core";
import SocketService from "./socket.service";
import {InstrumentSettings} from "../../../shared/interfaces/InstrumentSettings";
import {BehaviorSubject} from "../../node_modules/rxjs/BehaviorSubject";

@Injectable()
export default class ChartOverviewService {

    public charts: InstrumentSettings[] = [];

    private _charts: BehaviorSubject<InstrumentSettings[]>;

    private _defaultChartSettings: InstrumentSettings = {
        instrument: null,
        timeFrame: 'M15'
    };

    private _defaultCharts = [
        {
            instrument: 'EUR_USD',
        },
        {
            instrument: 'AUD_CAD'
        }
    ];

    constructor(private socketService: SocketService) {
        this.loadAll();
    }

    loadAll() {

        this.socketService.socket.emit('instrument:chart-list', {}, (err, list:InstrumentSettings[]) => {

            if (err)
                return console.error(err);

            if (!list || !list.length)
                list = this._defaultCharts;

            list.forEach((instrumentSettings:InstrumentSettings) => this.create(instrumentSettings));
        });
    }

    async create(instrumentSettings:InstrumentSettings) {
        // merge settings with defaults


        instrumentSettings = Object.assign({}, this._defaultChartSettings, instrumentSettings);

        // Set until time to [now] if not defined
        if (!instrumentSettings.until)
            instrumentSettings.until = Date.now();

        // Create on server if no ID is set, and merge returned config with requested config
        if (!instrumentSettings.id)
            Object.assign(instrumentSettings, await this._createOnServer(instrumentSettings));

            this.charts.push(instrumentSettings);
    }

    async destroy(id:string) {
        this.charts.forEach((c, i) => {
            if (c.id === id) {
                this.charts.splice(i, 1);
                this._destroyOnServer(id);
            }
        });
    }

    private _createOnServer(instrumentSettings): Promise<InstrumentSettings> {

        return new Promise((resolve, reject) => {

            this.socketService.socket.emit('instrument:create', {
                instrument: instrumentSettings.instrument,
                timeFrame: instrumentSettings.timeFrame,
                //start: start
            }, (err, instrumentSettings:InstrumentSettings) => {
                if (err)
                    return reject(err);

                resolve(instrumentSettings);
            });
        });
    }

    private _destroyOnServer(id) {
        return new Promise((resolve, reject) => {

            this.socketService.socket.emit('instrument:destroy', {id: id}, err => {
                if (err)
                    return reject(err);

                resolve();
            });
        });
    }

    // get charts () {
    //     return this._charts;
    // }
}