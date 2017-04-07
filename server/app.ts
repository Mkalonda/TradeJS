import * as path        from 'path';
import App              from './_app';

const app = new App({
	system: {
		port: 3000,
		timezone: 'America/New_York',
	},
	path: {
		cache: path.join(__dirname, '../_cache'),
		custom: path.join(__dirname, '../custom'),
		config: path.join(__dirname, 'config')
	}
});

app.init().then(() => {
	// if (!argv.web) {
	//     require('../../electron')();
	// }
}).catch(console.error);

export default app;