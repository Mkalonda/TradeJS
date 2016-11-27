import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {BacktestSettingsComponent}  from './settings/backtest-settings.component';
import {BacktestReportsComponent}   from "./reports/backtest-reports.component";
import {SocketService}              from "../../services/socket.service";
import * as moment                  from 'moment/moment';
import {ActivatedRoute} from "../../../../../node_modules/@angular/router/src/router_state";
import {Router} from '@angular/router';

@Component({
    selector: 'page-backtest',
    templateUrl: 'backtest.component.html',
    styleUrls: ['backtest.component.css']
})

export class BacktestComponent implements AfterViewInit {

    report = null;

    // we pass the Component we want to get
    // assign to a public property on our class
    // give it the type for our component
    @ViewChild(BacktestSettingsComponent) backtestSettings: BacktestSettingsComponent;
    @ViewChild(BacktestReportsComponent) backtestReports: BacktestReportsComponent;

    socket: any;

    constructor(socket: SocketService, private route: ActivatedRoute) {
        this.socket = socket.socket;
    }

    ngAfterViewInit(): void {
        let params = <any>this.route.snapshot.params;

        if (params.run === "true")
            this.run();

        this.backtestSettings.onSubmit = (event:Event) => {
            event.preventDefault();

            this.run();
        };
    }

    run() {
        this.backtestReports.toggleLoading(true);

        let data = Object.assign(this.backtestSettings.form.value);

        data.from = Date.now() - 1000000000; //moment(data.from,'dd/mm/yyyy').unix() * 1000;
        //data.until = moment(data.until, 'dd/mm/yyyy').unix() || Date.now();
        data.until = Date.now();

        this.socket.emit('backtest:run', data, (err, report) => {
            if (err)
                return this.toggleErrorState(err);

            this.report = report;

            this.backtestReports.toggleLoading(false);
        });
    }

    toggleErrorState(error) {
        alert(error);
        this.backtestReports.toggleLoading(false);
    }
}