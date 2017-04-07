import './polyfills';
import {AppModule} from './app/app.module';

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {environment} from './environments/environment';
import {enableProdMode} from '@angular/core';

if (environment.production) {
	enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule);

export default {};