import {Component, AfterViewInit, OnInit} from '@angular/core';
import {CookieService} from 'angular2-cookie/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {IMultiSelectOption} from 'angular-2-dropdown-multiselect/src/multiselect-dropdown';
import {BacktestSettingsModel} from "./backtest-settings.model";


@Component({
    selector: 'backtest-settings',
    templateUrl: 'backtest-settings.component.html',
    styleUrls: ['backtest-settings.component.css']
})

export class BacktestSettingsComponent implements OnInit, AfterViewInit {
    // we pass the Component we want to get
    // assign to a public property on our class
    // give it the type for our component

    private selectedOptions: number[];
    model: BacktestSettingsModel;

    multiSelectOptions: IMultiSelectOption[] = [
        <any>{ id: 'EUR_USD', name: 'EUR_USD' },
        <any>{ id: 'USD_CAD', name: 'USD_CAD' }
    ];
    
    static defaults = {
        EA: '',
        instruments: [],
        timeFrame: 'M15',
        from: new Date,
        until: new Date,
        equality: 10000,
        currency: 'euro',
        pips: '10'
    };

    form: FormGroup;

    constructor(private _cookieService:CookieService, private formBuilder: FormBuilder) {}

    validator() {

    }

    ngOnInit(): void {
        this.model  = new BacktestSettingsModel();
        this.model.update(this.loadSavedSettings());

        this.selectedOptions = this.model.instruments;

        this.form   = this.formBuilder.group(this.model);

        this.form.valueChanges.subscribe((data:any) => this.onChange(data));
    }

    ngAfterViewInit(): void {}

    onSubmit(event:Event): void {
        event.preventDefault();
    }

    onChange(event:Event): void {
        this.form.value.instruments = this.selectedOptions;

        Object.assign(this.model, this.form.value);

        this.saveSettings();
    }

    loadSavedSettings(): Object {
        return Object.assign({}, BacktestSettingsComponent.defaults, this.getCookie() || {});
    }

    saveSettings(): void {
        this._cookieService.put('backtest-settings', JSON.stringify(this.model));
    }

    getCookie(): Object | null {
        let data:any = null;

        try {
            let cookie = this._cookieService.get('backtest-settings');

            if (cookie)
                data = JSON.parse(cookie);

        } catch (err) {
            // TODO
        }

        return data;
    }

    toggleLoading(state:boolean) {
        // if (state) {
        //     $settingsForm.find('input, select, button').prop('disabled', true);
        //     $reportsContainer.html('<div class="loader-wrapper"><img src="/img/loader.gif" class="loader" /></div>');
        // } else {
        //     $settingsForm.find('input, select, button').prop('disabled', false);
        //     $reportsContainer.empty();
        // }
    }
}