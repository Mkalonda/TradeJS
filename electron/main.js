'use strict';

const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
console.log(app);

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({backgroundColor: '#2d2d2d', show: true});
    //win.setFullScreen(true);
    console.log('CREATE WINDOW');

    if (process.env.NODE_ENV === 'production') {
        win.loadURL('http://localhost:3000');
    } else {
        win.loadURL('http://localhost:4200');
        //win.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    });

    win.on('open', () => {
       require('../server/app').default;
    });

    // const template = [
    //     {
    //         label: 'Edit',
    //         submenu: [
    //             {
    //                 role: 'undo'
    //             },
    //             {
    //                 role: 'redo'
    //             },
    //             {
    //                 type: 'separator'
    //             },
    //             {
    //                 role: 'cut'
    //             },
    //             {
    //                 role: 'copy'
    //             },
    //             {
    //                 role: 'paste'
    //             },
    //             {
    //                 role: 'pasteandmatchstyle'
    //             },
    //             {
    //                 role: 'delete'
    //             },
    //             {
    //                 role: 'selectall'
    //             }
    //         ]
    //     },
    //     {
    //         label: 'View',
    //         submenu: [
    //             {
    //                 role: 'reload'
    //             },
    //             {
    //                 role: 'toggledevtools'
    //             },
    //             {
    //                 type: 'separator'
    //             },
    //             {
    //                 role: 'resetzoom'
    //             },
    //             {
    //                 role: 'zoomin'
    //             },
    //             {
    //                 role: 'zoomout'
    //             },
    //             {
    //                 type: 'separator'
    //             },
    //             {
    //                 role: 'togglefullscreen'
    //             }
    //         ]
    //     },
    //     {
    //         role: 'window',
    //         submenu: [
    //             {
    //                 role: 'minimize'
    //             },
    //             {
    //                 role: 'close'
    //             }
    //         ]
    //     },
    //     {
    //         role: 'help',
    //         submenu: [
    //             {
    //                 label: 'Learn More',
    //                 click () {
    //                     require('electron').shell.openExternal('http://electron.atom.io')
    //                 }
    //             }
    //         ]
    //     }
    // ]
    //
    // if (process.platform === 'darwin') {
    //     template.unshift({
    //         label: app.getName(),
    //         submenu: [
    //             {
    //                 role: 'about'
    //             },
    //             {
    //                 type: 'separator'
    //             },
    //             {
    //                 role: 'services',
    //                 submenu: []
    //             },
    //             {
    //                 type: 'separator'
    //             },
    //             {
    //                 role: 'hide'
    //             },
    //             {
    //                 role: 'hideothers'
    //             },
    //             {
    //                 role: 'unhide'
    //             },
    //             {
    //                 type: 'separator'
    //             },
    //             {
    //                 role: 'quit'
    //             }
    //         ]
    //     })
    //     // Edit menu.
    //     template[1].submenu.push(
    //         {
    //             type: 'separator'
    //         },
    //         {
    //             label: 'Speech',
    //             submenu: [
    //                 {
    //                     role: 'startspeaking'
    //                 },
    //                 {
    //                     role: 'stopspeaking'
    //                 }
    //             ]
    //         }
    //     )
    //
    //     // Window menu.
    //     template[3].submenu = [
    //         {
    //             label: 'Close',
    //             accelerator: 'CmdOrCtrl+W',
    //             role: 'close'
    //         },
    //         {
    //             label: 'Minimize',
    //             accelerator: 'CmdOrCtrl+M',
    //             role: 'minimize'
    //         },
    //         {
    //             label: 'Zoom',
    //             role: 'zoom'
    //         },
    //         {
    //             type: 'separator'
    //         },
    //         {
    //             label: 'Bring All to Front',
    //             role: 'front'
    //         }
    //     ]
    // }

    // const menu = Menu.buildFromTemplate(template)
    // Menu.setApplicationMenu(menu)
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
