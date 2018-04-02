import appInfo from './app.js';
import {get, post} from './http.js';

const configWechat = (result, callback) => {
  const configObj = {
    debug: false, // 开启调试模式,
    appId: appInfo.wxAPPID, // 必填，公众号的唯一标识
    timestamp: result.timestamp, // 必填，生成签名的时间戳
    nonceStr: result.nonceStr, // 必填，生成签名的随机串
    signature: result.signature, // 必填，签名，见附录1
    jsApiList: [
      'checkJsApi',
      'onMenuShareTimeline',
      'onMenuShareAppMessage',
      'onMenuShareQQ',
      'onMenuShareWeibo',
      'onMenuShareQZone',
      'getNetworkType',
      'openLocation',
      'getLocation',
      'closeWindow',
      'scanQRCode',
      'chooseWXPay'
    ]
  };
  wx.config(configObj);
  wx.ready(() => {
    callback && callback();
    // 间隔30分钟更新一次签名
    setTimeout(() => {
      wxGetSign(location.href);
    }, 30 * 60 * 1000);
  });
  wx.error((res) => {
    setTimeout(() => {
      !window.__messaged && (window.__messaged = true, window.toast || alert)('微信签名错误，请刷新页面重试或更新微信试试。');
      wxGetSign(location.href);
    }, 3000);
  });
}


// 每次获取新的token进行签名，防止后台刷新导致前台功能错误
export function wxGetSign(locationHref, callback) {
  const signPath = encodeURIComponent(locationHref.split('#')[0]);
  get(appInfo.apiPath.getWechatSign + '&' + appInfo.makeParams({
    url: signPath
  })).then((res) => {
    res.status != "OK" && alert('获取微信签名错误，请尝试刷新页面或重新进入');
    const result = res.result;
    const configWithAppID = () => {
      appInfo.wxAPPID && window.WeixinJSBridge
        ? configWechat(result, callback)
        : setTimeout(configWithAppID, 300);
    };
    appInfo.wxScript.__loaded
      ? configWithAppID()
      : appInfo.wxScript.onload = configWithAppID;
  });
}


export function wxPay(result, option) {
  wx.ready(() => {
    wx.chooseWXPay({
      timestamp: result.timestamp,
      nonceStr: result.nonceStr,
      package: result.pkg,
      signType: result.signType,
      paySign: result.paySign,
      success: function (res) {
        option && option.success && option.success(res);
      },
      cancel: function (res) {
        option && option.cancel && option.cancel(res);
      },
      fail: function (res) {
        option && option.fail && option.fail(res);
      }
    });
  });
}

export function wxShare(option) {
  wx.ready(() => {
    const shareObj = {
      title: option.title || '阿京妈直销平台', // 分享标题
      desc: option.desc || '好东西！与你一起分享', // 分享描述
      link: option.link || location.href, // 分享链接
      imgUrl: option.imgUrl || location.origin + '/favicon.ico', // 分享图标
      type: option.type || '', // 分享类型,music、video或link，不填默认为link
      dataUrl: option.dataUrl || '', // 如果type是music或video，则要提供数据链接，默认为空
      success: function () {
        option.success && option.success();
      },
      cancel: function () {
        option.success && option.cancel();
      }
    };
    option.type.indexOf('message') != -1 && wx.onMenuShareAppMessage(shareObj);
    option.type.indexOf('timeline') != -1 && wx.onMenuShareTimeline(shareObj);
  });
}
