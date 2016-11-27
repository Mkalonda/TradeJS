'use strict';

const url = require('url');
const path = require('path');

const {app, BrowserWindow} = require('electron');

module.exports = () => {
    // Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
    let win;

    function createWindow () {
        // Create the browser window.
        win = new BrowserWindow({backgroundColor: '##2d2d2d'});
        win.setFullScreen(true);

      // and load the index.html of the app.
        if (process.env.NODE_ENV === 'production') {
          win.loadURL('http://localhost:5000');
        } else {
            win.loadURL('http://localhost:4200');
            // win.loadURL(url.format({
            //     pathname: path.join(__dirname, 'dist/client/index.html'),
            //     protocol: 'file:',
            //     slashes: true
            // }))
        }

        // Open the DevTools.
        //win.webContents.openDevTools();

        // Emitted when the window is closed.
        win.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            win = null
        })
    }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
    app.on('ready', createWindow);

// Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    console.log('Electron app path: ', app.getAppPath());

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });

    app.appPath = app.getAppPath();
    app.init = true;

    return app;
};
