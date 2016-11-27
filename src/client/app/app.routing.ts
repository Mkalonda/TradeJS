import {RouterModule, Route}    from '@angular/router';
import {ModuleWithProviders}    from '@angular/core';
import {HomeComponent}          from "./pages/home/home.component";
import {BacktestComponent}      from "./pages/backtest/backtest.component";
import {EditorComponent}        from "./pages/editor/editor.component";
import {LoggedInGuard}          from "./guards/loggedin.guard";
import LoginComponent           from "./pages/auth/login/login.component";

const routes: Route[] = [
    {path: '', redirectTo: '/home', pathMatch: 'full'},
    {path: 'login', component: LoginComponent},
    {path: 'home', component: HomeComponent},
    {path: 'backtest', component: BacktestComponent},
    {path: 'editor', component: EditorComponent}
    //{path: 'editor', component: EditorComponent, canActivate: [LoggedInGuard]}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {
        useHash: true
    }
);
