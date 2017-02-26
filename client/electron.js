window.electron = (() => {
    "use strict";

    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;

    return {

        openWindow(url) {
            let win = new BrowserWindow({show: true, backgroundColor: '#2e2c29'});
            win.loadURL(url);

            return win;
        }
    };
})();