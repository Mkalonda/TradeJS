#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from '../app';
import { serverPort } from '../config';
import * as http from 'http';

app.on('app:ready', () => {
  // const port = normalizePort(process.env.PORT || serverPort);
  // app._server.set('port', port);
  //
  // /**
  //  * Create HTTP server.
  //  */
  // const server = http.createServer(app._server);
  //
  // /**
  //  * Listen on provided port, on all network interfaces.
  //  */
  //
  // server.listen(port);
  // server.on('error', onError);
  // server.on('listening', onListening);
  //
  // /**
  //  * Normalize a port into a number, string, or false.
  //  */
  //
  // function normalizePort(val): boolean | number {
  //
  //   const normalizedPort = parseInt(val, 10);
  //
  //   if (isNaN(normalizedPort)) {
  //     // named pipe
  //     return val;
  //   }
  //
  //   if (normalizedPort >= 0) {
  //     // port number
  //     return normalizedPort;
  //   }
  //
  //   return false;
  // }
  //
  // /**
  //  * Event listener for HTTP server 'error' event.
  //  */
  //
  // function onError(error) {
  //   if (error.syscall !== 'listen') {
  //     throw error;
  //   }
  //
  //   const bind = typeof port === 'string'
  //       ? 'Pipe ' + port
  //       : 'Port ' + port;
  //
  //   // handle specific listen errors with friendly messages
  //   switch (error.code) {
  //     case 'EACCES':
  //       console.error(bind + ' requires elevated privileges');
  //       process.exit(1);
  //       break;
  //     case 'EADDRINUSE':
  //       console.error(bind + ' is already in use');
  //       process.exit(1);
  //       break;
  //     default:
  //       throw error;
  //   }
  // }
  //
  // /**
  //  * Event listener for HTTP server 'listening' event.
  //  */
  //
  // function onListening() {
  //   const addr = server.address();
  //   const bind = typeof addr === 'string'
  //       ? 'pipe ' + addr
  //       : 'port ' + addr.port;
  //   console.log('Listening on ' + bind);
  // }
});