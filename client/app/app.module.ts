// Lib
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';

// Pages
import {HomeComponent}    from './pages/home/home.component';
import {EditorComponent}  from './pages/editor/editor.component';

// Components
import {HeaderComponent}  from './common/header/header.component';
import {DebuggerComponent} from './common/debugger/debugger.component';
import {FooterComponent}  from './common/footer/footer.component';
import {FileTreeComponent}  from './common/file-tree/file-tree.component';
import {JSEditorComponent}  from './common/jseditor/jseditor.component';

// Providers
import {SocketService} from './services/socket.service';
import {CookieModule} from 'ngx-cookie';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {routing} from './app.routing';

import {MultiselectDropdownModule} from 'angular-2-dropdown-multiselect/src/multiselect-dropdown';
import {InstrumentListComponent} from './common/intrument-list/instrument-list.component';
import {ChartOverviewComponent} from './common/chart-overview/chart-overview.component';
import {ReportComponent} from './common/report/report.component';
import {LoggedInGuard} from './guards/loggedin.guard';
import {UserService} from './services/user.service';
import {LoginComponent} from './common/login/login.component';
import {StatusComponent} from './common/footer/status/status.component';
import {SystemService} from './services/system.service';
import {ConstantsService} from './services/constants.service';
import {DialogComponent} from './common/dialog/dialog.component';
import {ModalComponent} from './common/modal/modal.component';
import {DialogAnchorDirective} from './directives/dialoganchor.directive';
import {ModalAnchorDirective} from './directives/modalanchor.directive';
import {ModalService} from './services/modal.service';
import {InstrumentsService} from './services/instruments.service';
import {DraggableDirective} from './directives/draggable.directive';
import {ResizableDirective} from './directives/resizable.directive';
import {ChartBoxComponent} from './common/chart-box/chart-box.component';
import {ChartComponent} from './common/chart/chart.component';
import {ChartReportDirective} from './common/chart/chart-report.directive';
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
		InstrumentListComponent,
		ChartOverviewComponent,
		ChartBoxComponent,
		ChartComponent,
		ReportComponent,
		StatusComponent,
		DialogComponent,
		DialogAnchorDirective,
		ModalComponent,
		ModalAnchorDirective,
		DraggableDirective,
		ResizableDirective,
		ChartReportDirective
	],
	imports: [
		BrowserModule,
		CookieModule.forRoot(),
		routing,
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		MultiselectDropdownModule
	],
	providers: [
		{provide: UserService, useClass: UserService},
		{provide: SystemService, useClass: SystemService},
		{provide: LoggedInGuard, useClass: LoggedInGuard},
		{provide: ConstantsService, useClass: ConstantsService},
		{provide: SocketService, useClass: SocketService},
		{provide: ModalService, useClass: ModalService},
		{provide: InstrumentsService, useClass: InstrumentsService}
	],
	bootstrap: [
		AppComponent
	]
})

export class AppModule {
}