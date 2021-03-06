const {app, BrowserWindow} = require('electron')
const path = require('path')
const ipc = require('electron').ipcMain;

// const net = require('net');
// const path_test = process.env.HOME + "/.UDS"+"_mc";
// const client = net.connect({ path: path_test});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let terminal
let win_rtmp

// add for rtmp
let pluginName

switch (process.platform) {
  case 'win32':
    pluginName = 'pepflashplayer.dll'
    break
  case 'darwin':
    pluginName = 'PepperFlashPlayer.plugin'
    break
  case 'linux':
    pluginName = 'libpepflashplayer.so'
    break
}

app.commandLine.appendSwitch('ppapi-flash-path', path.join(__dirname, pluginName));
// add for rtmp


function createWindow () {
  // for location
  process.env.GOOGLE_API_KEY = 'AIzaSyCQtW87ztHqA2ecB3h9os-nvt480gbz2Wg';

  // Create the browser window.

  win_rtmp = new BrowserWindow({
    width: 1280, 
    height: 800,
    webPreferences: {
      plugins: true
    },
    autoHideMenuBar: true
  })

  win = new BrowserWindow({
    width: 1280, 
    height: 800,
    autoHideMenuBar: true,
    // alwaysOnTop: true,
    parent: win_rtmp
  })

  // and load the index.html of the app.
  // win.loadURL(`file://${__dirname}/index.html`)
  // win.loadURL(`http://localhost:8000/index.html`)
  
  win.loadURL(`file://${__dirname}/template/pairing.html`)
  win_rtmp.loadURL(`http://localhost:8000/rtmp_video.html`);


  // win.loadURL(`http://127.0.0.1:8848/demo/index.html`)

  // Open the DevTools.
  // win.webContents.openDevTools()

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
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }

})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const ipcMain = require('electron').ipcMain;
var gstreamer = require('gstreamer');
var httpServer = require('http-server');
var server = httpServer.createServer();
server.listen(8000);

ipcMain.on('pairing_view', function(event, arg) {
  console.log(arg);  // prints "ping"
  event.sender.send('pairing-reply', 'pong');
});

ipcMain.on('index_view', function(event, arg) {
  console.log(arg);  // prints "ping"
  event.sender.send('index-reply', 'pong');

  // gstreamer
  gstreamer.start({
    port: 9000
  });

  // change for rtmp
  win.loadURL(`file://${__dirname}/index.html`)
  // win.loadURL(`http://localhost:8000/index.html`)
  // win.loadURL(`http://localhost:8000/rtmp_video.html`)
});

ipcMain.on('full-screen', function(event, arg) {
  console.log(arg);  // prints "ping"
  win.setFullScreen(true);
});

ipcMain.on('change-rtmp', function(event, arg) {
  // gstreamer.close();
  // win_rtmp.reload();
  // win_rtmp.loadURL(`http://localhost:8000/rtmp_video.html`);
});

ipcMain.on('change-gst', function(event, arg) {
  // gstreamer
  // gstreamer.start({port: 9000});
});

