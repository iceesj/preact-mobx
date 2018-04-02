// import 'promise-polyfill'; import 'isomorphic-fetch';
import {h, render} from 'preact';
import store from './components/stores';
import {Provider} from 'mobx-preact';
import FastClick from 'fastclick';
import appInfo from './utils/app'
import { toast } from './components/public/toast.js';
import { touchScroll } from './lib/touchScroll';
import {get,post} from './utils/http';
const apiPath = appInfo.apiPath
let root;
window.toast = toast;
const session = appInfo.getInfo('session');
if(!session){
  post(appInfo.apiPath.createSession).then((res)=>{
    if(res.status != 'OK'){
      toast(res.message);
      return;
    }
		appInfo.setInfo('session',res);
		appUpdate()
		init();
  })
}else{
	appUpdate()
	init();
}
// optimize touchscroll
touchScroll(true);
setTimeout(() => {
  FastClick.attach(document.body);
}, 0);

appInfo.getInfo('localUser') && (() => {
	let {cartStore} = store;
	// cartStore.initCart();
	// companyCartStore.initCart();
	// userStore.checkUserAttestation();
	// companyInfoStore.initCompanyIncartStorefo();
})()

function init() {
  let App = require('./components/app').default;
  root = render(
    <Provider {...store}><App/></Provider>, document.body, root);
}
// 微信环境加载微信交互脚本
const loadWechatScript = () => {
  let wxScript = document.createElement('script');
  wxScript.src = location.protocol + '//res.wx.qq.com/open/js/jweixin-1.0.0.js';
  wxScript.onload = () => {
    wxScript.__loaded = true;
  }
  appInfo.wxScript = wxScript;
  document
    .body
    .appendChild(wxScript);
};
// 微信环境加载脚本，无需session支持
appInfo.liveWechat && loadWechatScript();

// 获取微信签名ID
const getWechatAppId = () => {
  appInfo.wxAPPID = appInfo.getInfo('wxAPPID') || null;
  get(apiPath.getWechatAppId).then((res) => {
    (res.errorCode == '1') && (() => {
      post(apiPath.createSession).then(res => {
        if (res.status != 'OK')
          return toast(res.message);
        appInfo.setInfo('session', res);
        getWechatAppId()
        return;
      });
    })();
    if (res.status != "OK" && res.errorCode !== '1') {
      res.message && alert(res.message)
    } else {
      appInfo.setInfo('wxAPPID', res.result);
      appInfo.wxAPPID = res.result;
    }
    // 跳转登录用到
    getWechatAppId.callback && getWechatAppId.callback();
  });
};

// 获取支付宝签名ID
const getAlipayAppId = () => {
  appInfo.alipayAPPID = appInfo.getInfo('alipayAPPID') || null;
  get(apiPath.getAlipayAppId).then((res) => {
    (res.errorCode == '1') && (() => {
      post(apiPath.createSession).then(res => {
        if (res.status != 'OK')
          return toast(res.message);
        appInfo.setInfo('session', res);
        getAlipayAppId()
        return;
      })
    })()
    if (res.status != "OK") {
      res.message && alert(res.message)
    } else {
      appInfo.setInfo('alipayAPPID', res.result)
      appInfo.alipayAPPID = res.result;
    }
    // 跳转登录用到
    getAlipayAppId.callback && getAlipayAppId.callback();
  });
};

let hashNow = location.hash
let pathNow = location.pathname + location.search
let replaceHash = hashNow
  ? hashNow
  : '#' + pathNow
let wechatMatchQuery = location
  .search
  .match(/code=(.*)&state=(.*)/)
let alipayMatchQuery = location
  .search
  .match(/state=(.*)?&auth_code=(.*)/)
let matchTokenCode = wechatMatchQuery && wechatMatchQuery[1] || alipayMatchQuery && alipayMatchQuery[2]
appInfo.appLoginToken = matchTokenCode
appInfo.setInfo('frontLoginToken', matchTokenCode)
let stateHash = matchTokenCode && decodeURIComponent(wechatMatchQuery && wechatMatchQuery[2] || alipayMatchQuery && alipayMatchQuery[1]) || ''
location.hash = location.hash || stateHash || location.pathname || ''

const redirect = () => {
  let REDIRECT_LOGIN_URL;
  let wechatAppid = appInfo.getInfo('wxAPPID');
  let alipayAppid = appInfo.getInfo('alipayAPPID');
  let returnUrl = location.origin + (appInfo.liveAlipay && '/alipay/' || '/wechat/');
  let WECHAT_LOGIN_PATH = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid={APPID}&redirect_uri={' +
      'REDIRECT_URI}&response_type=code&scope=snsapi_base&state={STATE}#wechat_redirect';
  let ALIPAY_LOGIN_PATH = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id={APPID}&scope=a' +
      'uth_base&redirect_uri={REDIRECT_URI}&state={STATE}';
  appInfo.liveWechat && (REDIRECT_LOGIN_URL = WECHAT_LOGIN_PATH.replace('{APPID}', wechatAppid))
  appInfo.liveAlipay && (REDIRECT_LOGIN_URL = ALIPAY_LOGIN_PATH.replace('{APPID}', alipayAppid))
  REDIRECT_LOGIN_URL = REDIRECT_LOGIN_URL.replace('{REDIRECT_URI}', encodeURIComponent(returnUrl))
  REDIRECT_LOGIN_URL = REDIRECT_LOGIN_URL.replace('{STATE}', encodeURIComponent(replaceHash.substr(1)))
  location.replace(REDIRECT_LOGIN_URL)
}

// in development, set up HMR:
if (module.hot) {
  // require('preact/devtools');   // turn this on if you want to enable React
  // DevTools!
  module
    .hot
    .accept('./components/app', () => requestAnimationFrame(init));
}



function appUpdate(){
  const nativeUtil = window.nativeUtil ? window.nativeUtil : window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeUtil;
  const updateData = {};
	const updataPath = appInfo.liveIosApp ? apiPath.iosUpdate : apiPath.androidUpdate;
  get(updataPath).then((jsonResult) => {
      if (jsonResult.status != 'OK') {
          toast(jsonResult.message);
          return;
			}
      updateData.currentVersion = jsonResult.result.currentVersion;
      updateData.minVersion = jsonResult.result.minVersion;
      updateData.downloadUrl = jsonResult.result.downloadUrl;
      nativeUtil && nativeUtil.postMessage(JSON.stringify({
          action: 'updateApp',
          data: updateData
      }));
  });
};
