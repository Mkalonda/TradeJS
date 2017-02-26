import * as path        from 'path';
import * as minimist    from 'minimist';
import App              from './_app';

const argv: any = minimist(process.argv.slice(2));

if (!argv.web) {
    require('../tools/main')();
}

const app = new App({
    system: {
        port: 3000,
        timezone: 'America/New_York',
    },
    path: {
        cache: path.join(__dirname, '../cache'),
        custom: path.join(__dirname, '../custom'),
        config: path.join(__dirname, 'config')
    }
});

export default app;

app.init().then(() => {
    // if (!argv.web) {
    //     require('../../electron')();
    // }
}).catch(console.error);