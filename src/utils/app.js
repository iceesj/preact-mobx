import { getInfo, setInfo, clearInfo } from './base.js';
import paths from './apiPath.js';
const extendPath = () => {
  const sessionId = getInfo('session') && getInfo('session').result || '';
  const extroStr = ['sessionId='+sessionId, 'device=web', 'version=1.0.0'].join('&');
  for (let key in paths) {
    paths[key] = extendPath.extroStr ? paths[key].replace(extendPath.extroStr, extroStr) : paths[key] + '?' + extroStr
  }
  extendPath.extroStr = extroStr;
};

const _setInfo = (key, value) => {
  setInfo(key, value);
  key == 'session' && extendPath();
};
const _makeParams = (obj) => {
  let key;
  let paramStr = '';
  for (key in obj) {
    paramStr += (paramStr && '&' || '') + key + '=' + obj[key];
  }
  return paramStr;
}

const dateObj = (date)=>{
  if(!date){
      date =  new Date().getTime()
    }
    let dateObj = new Date(date);
    let year = dateObj.getFullYear();
    let month = dateObj.getMonth()+1<10?'0'+(dateObj.getMonth()+1) : (dateObj.getMonth()+1);
    let day = dateObj.getDate()<10?'0'+dateObj.getDate() : dateObj.getDate();
    let hour = dateObj.getHours()<10?'0'+dateObj.getHours() : dateObj.getHours();
    let minutes = dateObj.getMinutes()<10?'0'+dateObj.getMinutes():dateObj.getMinutes();
    let seconds = dateObj.getSeconds()<10?'0'+dateObj.getSeconds():dateObj.getSeconds();
    return {
      year : year,
      month : month,
      day : day ,
      hour : hour ,
      minutes : minutes ,
      seconds : seconds
    }
}

const moment = (_time) => {
  const time = _time !== undefined ? new Date(_time) : new Date;
  time.setMilliseconds(0);
  const Y = time.getFullYear();
  const M = time.getMonth() + 1;
  const MM = `0${time.getMonth() + 1}`.substr(-2);
  const D = time.getDate();
  const DD = `0${time.getDate()}`.substr(-2);
  const h = time.getHours();
  const hh = `0${time.getHours()}`.substr(-2);
  const m = time.getMinutes();
  const mm = `0${time.getMinutes()}`.substr(-2);
  const s = time.getSeconds();
  const ss = `0${time.getSeconds()}`.substr(-2);
  const format = (str) => {
    return str.replace(/YYYY/g, Y).replace(/MM/g, MM).replace(/DD/g, DD).replace(/hh/ig, hh).replace(/mm/g, mm).replace(/ss/ig, ss);
  }
  return {Y, M, MM, D, DD, h, hh, m, mm, s, ss, format};
};

const appInfo = {
  inApp: navigator.userAgent.match(/XS1H\(/),
  inAndroidApp: navigator.userAgent.match(/XS1H\(ANDROID-/),
  liveWechat: navigator.userAgent.match(/MicroMessenger/i),
  liveIosApp: navigator.userAgent.match(/XS1H\(IOS/i),
  liveAlipay: navigator.userAgent.match(/AlipayClient/i),
  apiPath: paths,
  getInfo: getInfo,
  setInfo: _setInfo,
  clearInfo: clearInfo,
  dateObj : dateObj,
  makeParams : _makeParams,
  moment: moment,
  session: {
    get(key){
      return sessionStorage.getItem(key);
    },
    set(key, value){
      sessionStorage.setItem(key, value);
    }
  }
};
extendPath(); // 根据本地 session 初始化 apiPath 参数

export default appInfo
