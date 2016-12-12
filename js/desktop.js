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


// In the renderer process.
const {desktopCapturer} = require('electron')

desktopCapturer.getSources({types: ['window','screen']}, (error, sources) => {
  if (error) throw error
  for (let i = 0; i < sources.length; ++i) {
    console.log(sources[i].name);
    if (sources[i].name === 'GStreamer Video Output') {
      navigator.webkitGetUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sources[i].id,
            minWidth: 1280,
            maxWidth: 1280,
            minHeight: 720,
            maxHeight: 720
          }
        }
      }, handleStream, handleError)
      return
    }
  }
})

function handleStream (stream) {
  document.querySelector('video').src = URL.createObjectURL(stream)
}

function handleError (e) {
  console.log(e)
}