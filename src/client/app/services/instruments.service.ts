import {Injectable, Output, EventEmitter} from '@angular/core';
import {InstrumentModel} from "../models/instrument.model";
import {InstrumentSettings} from "../../../shared/interfaces/InstrumentSettings";
import SocketService from "./socket.service";
import * as moment from 'moment';
import {Observable, BehaviorSubject} from "rxjs";

@Injectable()
export default class InstrumentsService {

    @Output() changed = new EventEmitter();

    public instruments$: BehaviorSubject<InstrumentModel[]> = new BehaviorSubject([]);

    private _instruments: InstrumentModel[] = [];
    private _defaults = [{instrument: 'EUR_USD'}, {instrument: 'AUD_CAD'}];

    get instruments() {
        return this._instruments;
    }

    constructor(private _socketService: SocketService) {
        this.init();
    }

    init(): void {
        this.loadRunningInstruments();
    }

    loadRunningInstruments() {
        this._socketService.socket.emit('instrument:chart-list', {}, (err, list: InstrumentSettings[]) => {

            if (err)
                return console.error(err);

            if (!list || !list.length)
                list = this._defaults;

            list.forEach((instrumentSettings: InstrumentSettings) => this.add(instrumentSettings));
        });
    }

    add(options) {
        let model = new InstrumentModel();
        model.set(options);

        this._instruments.push(model);
        this.instruments$.next(this._instruments);

        if (!model.data.id)
            this._createOnServer(model.data).then(options => {
                model.set(options);

                model.synced.emit(true);
            });
    }

    remove(model: InstrumentModel) {
        this._instruments.splice(this._instruments.indexOf(model), 1);
        this.instruments$.next(this._instruments);

        return this._destroyOnServer(model);
    }

    set(model: InstrumentModel, index: number) {
    }

    findByIndex(index: number): InstrumentModel {
        return this._instruments[index];
    }

    public fetch(model: InstrumentModel, from?: number, until?: number): Promise<any> {

        from = moment(new Date()).subtract(7, 'days').valueOf();
        until = Date.now();

        let startTime = Date.now();

        return new Promise((resolve, reject) => {

            this._socketService.socket.emit('instrument:read', {
                id: model.data.id,
                count: 300,
                until: until,
                from: from
            }, bars => {

                console.info(`Loading ${model.data.instrument} took: ${(Date.now() - startTime) / 1000} Seconds`);

                model.updateBars(bars);

                this._socketService.socket.emit('instrument:get-data', {
                    id: model.data.id,
                    count: bars.length
                }, (err, indicators) => {
                    if (err)
                        return alert('Error!' + err);


                    model.updateIndicators(indicators);
                    resolve({bars: bars, indicators: indicators});
                });
            });
        });
    }

    private _createOnServer(instrumentSettings): Promise<InstrumentSettings> {

        return new Promise((resolve, reject) => {

            this._socketService.socket.emit('instrument:create', {
                instrument: instrumentSettings.instrument,
                timeFrame: instrumentSettings.timeFrame,
                //start: start
            }, (err, instrumentSettings: InstrumentSettings) => {
                if (err)
                    return reject(err);

                resolve(instrumentSettings);
            });
        });
    }

    private _destroyOnServer(model: InstrumentModel) {
        return new Promise((resolve, reject) => {

            this._socketService.socket.emit('instrument:destroy', {id: model.data.id}, err => {
                if (err)
                    return reject(err);

                resolve();
            });
        });
    }
}