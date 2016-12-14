window.onload = function () {
        navigator.getUserMedia = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

        if(navigator.getUserMedia){
            console.log("支持调取摄像头麦克风");
        } else {
            showTips("不支持麦克风");
        }
    }
let authorization;
let voiceList = new Set();
let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
let AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx = new AudioContext();
let config = {};

config.token = "24.2df1ec9b2b7606a3ac7aea8430795540.2592000.1484131468.282335-8534212"
config.url="http://vop.baidu.com/server_api";

const BUFFER_SIZE = 1024;

authorize({
  token: config.token,
  url: config.url});
ready();

function ready() {

  var ele = document.getElementById('btn');
  var voice;
  var TEXT_N = 'Push Me';
  var TEXT_S = 'Listening';
  var TEXT_X = 'Recognizing';
  var status = false;
  ele.innerHTML = TEXT_N;
  ele.addEventListener(
      'touchstart',
      function (e) {
        console.log('touchstart');
        console.log(status);
          if (status == true) {
              return;
          }
          ele.innerHTML = TEXT_S;
          voice = createVoice();
          voice.push();
          e.preventDefault();
      }
  );
  ele.addEventListener(
    'touchend',
    function (e) {
      console.log('touchend');
        status = true;
        ele.innerHTML = TEXT_X;
        console.log(voice);
        voice
            .end()
            .result()
            .then(
                function (res) {
                    showTips(res);
                    console.log('Result: ' + res);
                },
                function (error) {
                    showTips('无法解析，请重试');
                    console.error('Error: ' + JSON.stringify(error));
                }
            )
            .then(
                function () {
                    status = false;
                    ele.innerHTML = TEXT_N;
                }
            );
        e.preventDefault();
    }
  );
}

function createVoice(options = {}) {
    // 当前音频的采样率
    options.sampleRate = ctx.sampleRate;
    options.token = config.token;
    options.url = config.url;
    let voice_ = new Voice(options);
    voice_.push();
    voiceList.add(voice_);
    return voice_;
}

/**
 * 合并 Float32Array
 *
 * @param {Array.<Float32Array>} list 待合并元素
 * @return {Float32Array}
 */
function mergeBuffers(list) {
    let item;
    let len = 0;
    for (item of list) {
      console.log(item);
      console.log(typeof(item))
      if(typeof(item) != 'undefined'){
        len += item.length; 
      }  
    }
    let res = new Float32Array(len);
    let offset = 0;
    for (item of list)  {
      if(typeof(item) != 'undefined'){
        res.set(item, offset);
        offset += item.length;
      }
    }

    return res;
}

/**
 * 语音对象
 *
 * @class
 */
class Voice {

    /**
     * 构造函数
     *
     * @param {Object} options 构造参数
     * @param {number} options.sampleRate 音频采样率
     * @param {string} options.token 语音识别 token
     * @param {string=} options.url 语音识别 URL
     * @param {number=} options.outputSampleRate 语音识别采样率
     * @param {string=} options.lang 语言类别
     */
    constructor(options) {
        this.config = $.extend({}, options);

        this.isOver = false;
        this.data = new Set();
        this.recognizing;
    }

    /**
     * 添加语音数据
     *
     * @public
     * @param {Object} buffer 语音数据
     */
    push(buffer) {
        this.data.add(buffer);
    }

    /**
     * 语音识别
     *
     * @public
     * @return {Prmise}
     */
    result() {
        if (!this.data.size) {
            return Promise.reject('no data');
        }

        if (!this.recognizing) {
          console.log(this.data);
            this.recognizing = recognize(
                mergeBuffers(this.data),
                this.config
            );
        }

        return this.recognizing;
    }

    /**
     * 结束语音采集
     *
     * @public
     * @return {Object}
     */
    end() {
        this.isOver = true;
        return this;
    }

    /**
     * 导出 WAV 格式
     *
     * @public
     * @param {number=} sampleRate 输出的采样率，默认为 8000
     * @return {ArrayBuffer}
     */
    wav(sampleRate = 8000) {
        let data = convertSampleRate(
            mergeBuffers(this.data),
            this.sampleRate,
            sampleRate
        );
        let buffer = new ArrayBuffer(44 + data.length * 2);
        let view = new DataView(buffer);

        /* RIFF identifier */
        writeASCII(view, 0, 'RIFF');
        /* file length */
        view.setUint32(4, 32 + data.length * 2, true);
        /* RIFF type */
        writeASCII(view, 8, 'WAVE');
        /* format chunk identifier */
        writeASCII(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, 1, true);
        /* sample rate */
        view.setUint32(24, sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, sampleRate, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        writeASCII(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, data.length * 2, true);
        /* data */
        write16PCM(view, 44, data);

        return buffer;
    }
}



/**
 * 写入 16 位 PCM
 *
 * @param {DataView} data 目标数据
 * @param {number} offset 偏移量
 * @param {Float32Array} buffer 语音数据源
 * @return {number}
 */
function write16PCM(data, offset, buffer) {
    for (let i = 0, len = buffer.length, s; i < len; i++, offset += 2) {
        s = Math.max(-1, Math.min(1, buffer[i]));
        data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return offset;
}

/**
 * 写入 ASCII 字符
 *
 * @param {DataView} data 目标数据
 * @param {number} offset 偏移量
 * @param {string} str ASCII 字符串
 * @return {number}
 */
function writeASCII(data, offset, str) {
    for (let i = 0, len = str.length; i < len; i++, offset++) {
        data.setUint8(offset, str.charCodeAt(i));
    }
    return offset;
}

/**
 * 写入 Uint8Array
 *
 * @param {DataView} data 目标数据
 * @param {number} offset 偏移量
 * @param {Uint8Array} buffer 数据源
 * @return {number}
 */
function writeUint8Array(data, offset, buffer) {
    for (let v of buffer) {
        data.setUint8(offset++, v);
    }
    return offset;
}

/**
 * 采样率转化
 *
 * @param {Float32Array} data 语音数据
 * @param {number} inputRate 输入采样率
 * @param {number} outputRate 输出采样率
 * @return {Float32Array}
 */
function convertSampleRate(data, inputRate, outputRate) {
    let rate = inputRate / outputRate;
    let len = Math.ceil(data.length / rate);
    let res = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        res[i] = data[Math.floor(i * rate)];
    }

    return res;
}



// recongnise


/**
 * @file 语音识别
 * @author treelite(c.xinle@gmail.com)
 */

function getUid() {
    return Math.random().toString(35).substring(2, 17);
}


/**
 * 8K 采样率
 *
 * @const
 * @type {number}
 */
const SAMPLE_RATE_8K = 8000;

/**
 * 16K 采样率
 *
 * @const
 * @type {number}
 */
const SAMPLE_RATE_16K = 16000;

/**
 * 默认的语音识别采样率
 *
 * @const
 * @type {number}
 */
const SAMPLE_RATE = SAMPLE_RATE_8K;

/**
 * 默认的语言类型
 *
 * @const
 * @type {string}
 */
const DEFAULT_LANG = 'zh';

/**
 * 语音识别 API 地址
 *
 * @const
 * @type {string}
 */
const URL_API = 'http://vop.baidu.com/server_api';

/**
 * 设别 ID
 *
 * @const
 * @type {string}
 */
const UID = getUid();

/**
 * 发送请求
 *
 * @param {string} url 请求地址
 * @param {Object} params 请求参数
 * @param {Function} resolve Promise resolve
 * @param {Function} reject Promise reject
 */
function send(url = URL_API, params, resolve, reject) {
    let xhr = new XMLHttpRequest();
    let data = JSON.stringify(params);
    xhr.open('POST', url);
    xhr.responseType = 'json';
    xhr.onload = () => {
        if (xhr.status === 200) {
            let res = xhr.response;
            if (!res.err_no) {
                resolve(res.result);
            }
            else {
                reject({type: res.err_no, message: res.err_msg});
            }
        }
        else {
            reject({type: xhr.status});
        }
    };
    xhr.ontimeout = () => {
        reject({type: 'timeout'});
    };
    xhr.onerror = () => {
        reject({type: 'unknow'});
    };
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(data);
}


/**
 * 语音识别
 *
 * @public
 * @param {Float32Array} data 语音数据
 * @param {Object} options 配置信息
 * @param {string} options.token 语音识别 token
 * @param {number} options.sampleRate 输入语音的采样率
 * @param {number=} options.outputSampleRate 语音识别采样率 默认为 8000
 * @param {string=} options.lang 语言类别，支持 zh(中文)、ct(粤语)、en(英文)，默认为 zh
 * @return {Promise}
 */
function recognize(data, options = {}) {
    // 采样率转化
    let outputSampleRate = options.outputSampleRate || SAMPLE_RATE;
    data = convertSampleRate(data, options.sampleRate, outputSampleRate);

    // 32bit to 16bit
    let buffer = new ArrayBuffer(data.length * 2);
    let dataView = new DataView(buffer);
    write16PCM(dataView, 0, data);

    // base64
    let str = '';
    let bytes = new Uint8Array(dataView.buffer);
    for (let bit of bytes) {
        str += String.fromCharCode(bit);
    }
    data = btoa(str);

    let params = {
        format: 'pcm',
        rate: outputSampleRate,
        channel: 1,
        cuid: UID,
        token: options.token,
        lan: options.lang || DEFAULT_LANG,
        len: bytes.length,
        speech: data
    };
    return new Promise((resolve, reject) => send(options.url, params, resolve, reject));
}


/**
 * 复制
 *
 * @private
 * @param {Object} target 目标对象
 * @param {Object} source 源对象
 */
function copy(target, source) {
    Object.keys(source).forEach((key) => {
        target[key] = source[key];
    });
}

/**
 * 对象属性拷贝
 *
 * @param {Object} target 目标对象
 * @param {...Object} sources 源对象
 * @return {Object}
 */
function extend(target, ...sources) {
    for (let item of sources) {
        if (!item) {
            continue;
        }
        copy(target, item);
    }

    return target;
}


/**
 * 语音采集授权
 *
 * @public
 * @param {Object} options 配置参数
 * @param {string} options.token 语音识别 token
 * @param {string=} options.url 语音识别 URL
 * @return {Promise}
 */
function authorize(options) {
    config.token = options.token;
    config.url = options.url;

    if (!authorization) {
        authorization = new Promise((resolve, reject) => {
            getUserMedia.call(
                navigator,
                {audio: true},
                (e) => {
                    gather(e);
                    resolve();
                },
                reject
            );
        });
    }
    return authorization;
}

/**
 * 音频采集
 *
 * @private
 * @param {Object} e 语音采集信息
 */
function gather(e) {
    let volume = ctx.createGain();
    let source = ctx.createMediaStreamSource(e);
    let processor = ctx.createScriptProcessor(BUFFER_SIZE, 1, 1);

    processor.onaudioprocess = (e) => {
        let item;
        for (item of voiceList) {
            if (item.isOver) {
                voiceList.delete(item);
            }
        }
        if (!voiceList.size) {
            return;
        }

        let buffer;
        let input = e.inputBuffer;

        for (let item of voiceList) {
            buffer = new Float32Array(input.length);
            input.copyFromChannel(buffer, 0, 0);
            item.push(buffer);
        }
    };

    source.connect(volume);
    volume.connect(processor);
    processor.connect(ctx.destination);
}