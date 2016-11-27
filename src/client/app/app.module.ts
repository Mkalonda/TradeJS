// Lib
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {StoreLogMonitorModule, useLogMonitor} from '@ngrx/store-log-monitor';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';

// Pages
import {HomeComponent}    from './pages/home/home.component';

import {BacktestComponent}    from './pages/backtest/backtest.component';
import {BacktestSettingsComponent} from './pages/backtest/settings/backtest-settings.component';
import {BacktestReportsComponent} from './pages/backtest/reports/backtest-reports.component';


import {EditorComponent}  from './pages/editor/editor.component';

// Components
import HeaderComponent  from './common/header/header.component';
import DebuggerComponent from './common/debugger/debugger.component';
import FooterComponent  from './common/footer/footer.component';
import FileTreeComponent  from './common/file-tree/file-tree.component';
import JSEditorComponent  from './common/jseditor/jseditor.component';
import {ChartComponent}  from './common/chart/chart.component';

// Providers
import {SocketService} from './services/socket.service';
import {CookieService} from 'angular2-cookie/services/cookies.service';
import {NgForm, FormsModule, ReactiveFormsModule} from "@angular/forms";

import {AppComponent} from './app.component';
import {routing} from './app.routing';

import {MultiselectDropdownModule} from 'angular-2-dropdown-multiselect/src/multiselect-dropdown';
import InstrumentListComponent from "./common/intrument-list/instrument-list.component";
import ChartOverviewComponent from "./common/chart-overview/chart-overview.component";
import ReportComponent from "./common/report/report.component";
import {LoggedInGuard} from "./guards/loggedin.guard";
import {UserService} from "./services/user.service";
import LoginComponent from "./pages/auth/login/login.component";

import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import StatusComponent from "./common/footer/status/status.component";
import {SystemService} from "./services/system.service";
import {ConstantsService} from "./services/constants.service";
import ChartOverviewService from "./services/chart-overview.service";
import {TodoService} from "./services/todo.service";

@NgModule({
    declarations: [
        AppComponent,

        LoginComponent,
        HeaderComponent,
        DebuggerComponent,
        FooterComponent,

        HomeComponent,
        BacktestComponent,
        EditorComponent,

        BacktestSettingsComponent,
        BacktestReportsComponent,

        JSEditorComponent,
        FileTreeComponent,
        ChartComponent,
        InstrumentListComponent,
        ChartOverviewComponent,
        ReportComponent,
        StatusComponent
    ],
    imports: [
        BrowserModule,
        routing,
        FormsModule,
        ReactiveFormsModule,
        StoreDevtoolsModule.instrumentStore({
            monitor: useLogMonitor({
                visible: true,
                position: 'right'
            })
        }),
        StoreLogMonitorModule,
        HttpModule,
        MultiselectDropdownModule,
        Ng2Bs3ModalModule
    ],
    providers: [
        SocketService,
        CookieService,
        UserService,
        SystemService,
        ChartOverviewService,
        TodoService,
        LoggedInGuard,
        ConstantsService
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule {}
