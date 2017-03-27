// const electron = require('electron')
// const desktopCapturer = electron.desktopCapturer
// const electronScreen = electron.screen
// const shell = electron.shell

// const fs = require('fs')
// const os = require('os')
// const path = require('path')

// const screenshot = document.getElementById('screen-shot')
// const screenshotMsg = document.getElementById('screenshot-path')

// screenshot.addEventListener('click', function (event) {
//   screenshotMsg.textContent = 'Gathering screens...'
//   const thumbSize = determineScreenShotSize()
//   let options = { types: ['screen'], thumbnailSize: thumbSize }

//   desktopCapturer.getSources(options, function (error, sources) {
//     if (error) return console.log(error)

//     sources.forEach(function (source) {
//       if (source.name === 'Entire screen' || source.name === 'Screen 1') {
//         const screenshotPath = path.join(os.tmpdir(), 'screenshot.png')

//         fs.writeFile(screenshotPath, source.thumbnail.toPng(), function (error) {
//           if (error) return console.log(error)
//           shell.openExternal('file://' + screenshotPath)
//           const message = `Saved screenshot to: ${screenshotPath}`
//           screenshotMsg.textContent = message
//         })
//       }
//     })
//   })
// })

// function determineScreenShotSize () {
//   const screenSize = electronScreen.getPrimaryDisplay().workAreaSize
//   const maxDimension = Math.max(screenSize.width, screenSize.height)
//   return {
//     width: maxDimension * window.devicePixelRatio,
//     height: maxDimension * window.devicePixelRatio
//   }
// }

global.videoType = "GStreamer Video Output"

// In the renderer process.
const {ipcRenderer, desktopCapturer} = require('electron')
findVideo(videoType);

var mqtt = require('mqtt');
var mqttClient  = mqtt.connect('tcp://queue.airforceuav.com:1883',{
  username: 'AirForceUAV',
  password: 'AirForceUAV123'
});

  mqttClient.on('connect', function () {
    console.log('mqttClient connect');
    mqttClient.subscribe('Video');
  })
  mqttClient.on('error',function(){
    console.log('mqttClient error');
  })
  mqttClient.on('close',function(){
    console.log('mqttClient close');
  })
  mqttClient.on('offline',function(){
    console.log('mqttClient offline');
  })
  mqttClient.on('error',function(){
    console.log('mqttClient error');
  })

  mqttClient.on('message', function (topic, message) {
    // message is Buffer
    console.log(message.toString());
  })

$(".change-proto").on("click", function () {
//   clien = new Paho.MQTT.Client("test.mosquitto.org", 8080, "myClientId");

//   // set callback handlers
// clien.onConnectionLost = onConnectionLost;
// clien.onMessageArrived = onMessageArrived;

// // connect the client
// clien.connect({onSuccess:onConnect});

// // called when the client connects
// function onConnect() {
//   // Once a connection has been made, make a subscription and send a message.
//   console.log("onConnect");
//   clien.subscribe("FlightLog", 1);
// }

// // called when the client loses its connection
// function onConnectionLost(responseObject) {
//   if (responseObject.errorCode !== 0) {
//     console.log("onConnectionLost:"+responseObject.errorMessage);
//   }
// }

// // called when a message arrives
// function onMessageArrived(message) {
//     console.log(message.payloadString);
// }

//   clien.send("FlightLog", "heelp");
//     clien.send("FlightLog", "heelp");

//   clien.send("FlightLog", "heelp");

//   clien.send("FlightLog", "heelp");

//   clien.send("FlightLog", "heelp");


  if(videoType == 'GStreamer Video Output'){
      mqttClient.publish('Video', 'WAN',{qos: 2});
      videoType = 'UAV-RTMP';
      ipcRenderer.send('change-rtmp', 'ping');
      findVideo(videoType);
  }else{
    mqttClient.publish('Video', 'LAN',{qos: 2});
    videoType = 'GStreamer Video Output';
    ipcRenderer.send('change-gst', 'ping');
    findVideo(videoType);
  }

});

function handleStream (stream) {
  document.querySelector('video').src = URL.createObjectURL(stream)
  console.log("handle stream");
  // ipcRenderer.send('full-screen', 'ping');
}

function handleError (e) {
  console.log(e)
}

function findVideo(type){
  desktopCapturer.getSources({types: ['window','screen']}, (error, sources) => {
    if (error) throw error
    for (let i = 0; i < sources.length; ++i) {
      console.log(sources[i].name);
      if (sources[i].name === type) {
       // navigator.mediaDevices.getUserMedia()
        navigator.webkitGetUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sources[i].id,
              minWidth: 1280,
              maxWidth: 1280,
              minHeight: 742,
              maxHeight: 742
            }
          }
        }, handleStream, handleError)
        return
      }
    }
  })
}