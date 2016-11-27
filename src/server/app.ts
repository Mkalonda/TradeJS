import * as path        from 'path';
import * as minimist    from 'minimist';
import App              from './_app';

const argv: any = minimist(process.argv.slice(2));

if (argv.electron) {
    require('../../electron')();
}

const app = new App({
    system: {
        port: 3000,
        timezone: 'America/New_York',
    },
    path: {
        cache: path.join(__dirname, '../../cache'),
        custom: path.join(__dirname, '../../custom')
    }
});

app
    .init()
    .then(() => {

    })
    .catch(console.error);

export default app;


/*
 import * as express from 'express';
 import { json, urlencoded } from 'body-parser';
 import * as path from 'path';
 import * as cors from 'cors';
 import * as compression from 'compression';

 import minimist = require("minimist");
 const argv = <any>minimist(process.argv.slice(2));

 import { loginRouter } from './routes/login';
 import { protectedRouter } from './routes/protected';
 import { publicRouter } from './routes/public';
 import { feedRouter } from './routes/feed';

 const app: express.Application = express();

 app.disable('x-powered-by');

 app.use(json());
 app.use(compression());
 app.use(urlencoded({ extended: true }));

 // allow cors only for local dev
 app.use(cors({
 origin: 'http://localhost:4200'
 }));

 // app.set('env', 'production');

 // api routes
 app.use('/api/secure', protectedRouter);
 app.use('/api/login', loginRouter);
 app.use('/api/public', publicRouter);
 app.use('/api/feed', feedRouter);

 if (app.get('env') === 'production') {

 // in production mode run application from dist folder
 app.use(express.static(path.join(__dirname, '/../client')));
 }

 // catch 404 and forward to error handler
 app.use(function(req: express.Request, res: express.Response, next) {
 let err = new Error('Not Found');
 next(err);
 });

 // production error handler
 // no stacktrace leaked to user
 app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {

 res.status(err.status || 500);
 res.json({
 error: {},
 message: err.message
 });
 });

 export { app }

 if (argv.electron) {
 require('../../electron')();
 }
 */