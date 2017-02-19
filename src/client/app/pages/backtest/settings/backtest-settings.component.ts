import {Component, AfterViewInit, OnInit, ElementRef} from '@angular/core';
import {CookieService}  from 'angular2-cookie/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {IMultiSelectOption, IMultiSelectSettings} from 'angular-2-dropdown-multiselect/src/multiselect-dropdown';
import {BacktestSettingsModel} from "./backtest-settings.model";
import SocketService    from "../../../services/socket.service";
import * as moment      from 'moment'

@Component({
    selector: 'backtest-settings',
    templateUrl: './backtest-settings.component.html',
    styleUrls: ['./backtest-settings.component.scss']
})

export class BacktestSettingsComponent implements OnInit, AfterViewInit {
    // we pass the Component we want to get
    // assign to a public property on our class
    // give it the type for our component

    private _report: any = null;
    private _isRunning: boolean = false;
    private _selectedOptions: number[];
    private _$el: any;

    model: BacktestSettingsModel;

    multiSelectOptions: IMultiSelectOption[] = [
        <any>{id: 'EUR_USD', name: 'EUR_USD'},
        <any>{id: 'USD_CAD', name: 'USD_CAD'}
    ];

    private multiSelectSettings: IMultiSelectSettings = {
        buttonClasses: 'btn btn-multi-select',
        maxHeight: '200px',
        showUncheckAll: true
    };

    static defaults = {
        EA: '',
        instruments: [],
        timeFrame: 'M15',
        from: new Date(),
        until: new Date(),
        equality: 10000,
        currency: 'euro',
        pips: '10'
    };

    form: FormGroup;

    constructor(private _cookieService: CookieService,
                private formBuilder: FormBuilder,
                private _socketService: SocketService,
                private _elementRef: ElementRef) {
    }

    ngOnInit(): void {
        this._$el = $(this._elementRef.nativeElement);

        this.model = new BacktestSettingsModel();
        this.model.update(this.loadSavedSettings());
        this.model.from = this._parseDate(this.model.from);
        this.model.until = this._parseDate(this.model.until);

        this._selectedOptions = this.model.instruments;

        this.form = this.formBuilder.group(this.model);

        this.form.valueChanges.subscribe(() => this.onChange());
    }

    ngAfterViewInit(): void {
    }

    run() {
        this._isRunning = true;
        this.toggleLoading(true);

        let data = Object.assign({}, this.model, {
            from: moment(this.model, 'YYYY-MM-DD').valueOf(),
            until: moment(this.model, 'YYYY-MM-DD').valueOf()
        });

        this._socketService.socket.emit('backtest:run', data, (err, report) => {
            this._report = report;
            console.log(report);
            this._isRunning = false;
            this.toggleLoading(false);
        });
    }

    onChange(): void {
        Object.assign(this.model, this.form.value, {instruments: this._selectedOptions});

        this.saveSettings();
    }

    onSubmit(event: Event): void {
        event.preventDefault();

        this.run();
    }

    loadSavedSettings(): Object {
        return Object.assign({}, BacktestSettingsComponent.defaults, this.getCookie() || {});
    }

    saveSettings(): void {
        this._cookieService.put('backtest-settings', JSON.stringify(this.model));
    }

    getCookie(): Object | null {
        let data: any = null;

        try {
            let cookie = this._cookieService.get('backtest-settings');

            if (cookie)
                data = JSON.parse(cookie);

        } catch (err) {
            // TODO
        }

        return data;
    }


    toggleLoading(state: boolean) {
        if (state) {
            this._$el.find('input, select, button').prop('disabled', true);
            //$reportsContainer.html('<div class="loader-wrapper"><img src="/img/loader.gif" class="loader" /></div>');
        } else {
            this._$el.find('input, select, button').prop('disabled', false);
            //$reportsContainer.empty();
        }
    }

    private _parseDate(date: String | Date): String {
        return moment(date).format('YYYY-MM-DD');
    }
}