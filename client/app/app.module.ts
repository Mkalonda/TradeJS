// Lib
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {StoreLogMonitorModule} from '@ngrx/store-log-monitor';

// Pages
import {HomeComponent}    from './pages/home/home.component';
import {EditorComponent}  from './pages/editor/editor.component';

// Components
import HeaderComponent  from './common/header/header.component';
import DebuggerComponent from './common/debugger/debugger.component';
import FooterComponent  from './common/footer/footer.component';
import FileTreeComponent  from './common/file-tree/file-tree.component';
import JSEditorComponent  from './common/jseditor/jseditor.component';

// Providers
import SocketService from './services/socket.service';
import {CookieService} from 'angular2-cookie/services/cookies.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {routing} from './app.routing';

import {MultiselectDropdownModule} from 'angular-2-dropdown-multiselect/src/multiselect-dropdown';
import InstrumentListComponent from './common/intrument-list/instrument-list.component';
import ChartOverviewComponent from './common/chart-overview/chart-overview.component';
import ReportComponent from './common/report/report.component';
import {LoggedInGuard} from './guards/loggedin.guard';
import {UserService} from './services/user.service';
import LoginComponent from './common/login/login.component';

import StatusComponent from './common/footer/status/status.component';
import SystemService from './services/system.service';
import {ConstantsService} from './services/constants.service';
import {DialogComponent} from './common/dialog/dialog.component';
import {ModalComponent} from './common/modal/modal.component';
import {DialogAnchorDirective} from './directives/dialoganchor.directive';
import {ModalAnchorDirective} from './directives/modalanchor.directive';
import ModalService from './services/modal.service';
import InstrumentsService from './services/instruments.service';
import {DraggableDirective} from './directives/draggable.directive';
import {ResizableDirective} from './directives/resizable.directive';
import {ChartBoxComponent} from './common/chart-box/chart-box.component';
import {ChartDirective} from './directives/chart/chart.directive';
import {ChartReportDirective} from './directives/chart/chart-report.directive';
import {BacktestSettingsComponent} from './common/backtest-settings/backtest-settings.component';
import {BacktestReportsComponent} from './common/backtest-report/backtest-reports.component';


@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HeaderComponent,
        DebuggerComponent,
        FooterComponent,

        HomeComponent,
        EditorComponent,

        BacktestSettingsComponent,
        BacktestReportsComponent,
        JSEditorComponent,
        FileTreeComponent,
        ChartBoxComponent,
        InstrumentListComponent,
        ChartOverviewComponent,
        ReportComponent,
        StatusComponent,
        DialogComponent,
        DialogAnchorDirective,
        ModalComponent,
        ModalAnchorDirective,
        DraggableDirective,
        ResizableDirective,
        ChartDirective,
        ChartReportDirective
    ],
    imports: [
        BrowserModule,
        routing,
        FormsModule,
        ReactiveFormsModule,
        // StoreLogMonitorModule,
        HttpModule,
        MultiselectDropdownModule
    ],
    providers: [
        CookieService,
        UserService,
        SystemService,
        LoggedInGuard,
        ConstantsService,
        SocketService,
        ModalService,
        InstrumentsService
    ],
    bootstrap: [
        AppComponent
    ]
})

export class AppModule {}