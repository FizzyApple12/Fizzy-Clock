const {app, BrowserWindow, Tray, nativeImage, ipcMain, dialog} = require('electron');
const sound = require('sound-play');
const path = require('path');
const fs = require('fs');

var tray = undefined;
var window = undefined;

var trayImage = nativeImage.createFromPath('./assets/icon.png');
trayImage = trayImage.resize({ width: 32, height: 16 });

const alarmsPath = './alarms.json';
const ringtonesPath = './ringtones/';

app.dock.hide();

if (!fs.existsSync(alarmsPath)) {
    fs.writeFile(alarmsPath, JSON.stringify({ 
        alarms: []
    }), ()=>{})
}

if (!fs.existsSync(ringtonesPath)) {
    fs.mkdir(ringtonesPath);
}

app.on('ready', () => {
    createTray();
    createWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});

const createWindow = () => {
    window = new BrowserWindow({
        width: 450,
        height: 300,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            backgroundThrottling: false,
            nodeIntegration: true
        }
    });
    window.loadFile('./index.html');

    window.on('blur', () => {
        if (!window.webContents.isDevToolsOpened()) window.hide();
    });
}

const createTray = () => {
    tray = new Tray(trayImage);
    tray.setToolTip('Fizzy Clock')
    tray.on('right-click', toggleWindow);
    tray.on('double-click', toggleWindow);
    tray.on('click', (event) => {
        toggleWindow();
        if (window.isVisible() && process.defaultApp && event.metaKey) window.openDevTools({ mode: 'detach' });
    })
}

const getWindowPosition = () => {
    var windowBounds = window.getBounds();
    var trayBounds = tray.getBounds();

    return {
        x: Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2)), 
        y: Math.round(trayBounds.y + trayBounds.height + 4)
    }
}

const toggleWindow = () => {
    if (window.isVisible()) window.hide();
    else showWindow();
}

const showWindow = () => {
    var position = getWindowPosition();
    window.setPosition(position.x, position.y, false);
    window.show();
    window.focus();
}

ipcMain.on('alarm', (event, arg) => {
    dialog.showMessageBox({ 
        type: 'info',
        buttons: [ 'Dismiss' ],
        title: 'Alarm',
        message: arg.description,
        icon: nativeImage.createFromPath('./assets/alarm.png')
    });
    sound.play(`${ringtonesPath}${arg.sound}`);
});

ipcMain.on('savealarms', (event, arg) => {
    fs.writeFile(alarmsPath, JSON.stringify({ 
        alarms: arg
    }), ()=>{})
});

ipcMain.on('loadalarms', (event, arg) => {
    event.reply('loadalarms_cb', require(alarmsPath).alarms);
});