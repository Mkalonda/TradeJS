import {RouterModule, Route}    from '@angular/router';
import {ModuleWithProviders}    from '@angular/core';
import {HomeComponent}          from './pages/home/home.component';
import {EditorComponent}        from './pages/editor/editor.component';
import {LoginComponent}         from './common/login/login.component';

const routes: Route[] = [
	{path: '', redirectTo: '/home', pathMatch: 'full'},
	{path: 'login', component: LoginComponent},
	{path: 'home', component: HomeComponent},
	{path: 'editor', component: EditorComponent}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {
		useHash: true
	}
);
