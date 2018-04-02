import { h, Component } from 'preact';
// import {Get, Post} from '../services/fetch.js';
// import apiPath, {makeParams} from './apiPath.js';
import { get, post } from './http.js';
import { route } from 'preact-router';
import appInfo, { getInfo, setInfo, clearInfo } from './app.js';
import { wxPay } from './wechat.js';
import { stringify } from 'querystring';

export function appPay(tradeId, payChannel, successCallback, failCallback) {
  // 更新订单，准备支付
  post(appInfo.apiPath.updateOrder + '&' + appInfo.makeParams({ tradeId: tradeId })).then(jsonResult => {
    if (jsonResult.status != "OK") {
      toast(jsonResult.message);
      return;
		}
		// appInfo.liveAlipay && payChannel == 'ZHIFUBAO_WEB' && (payChannel = 'ZHIFUBAO_FTF');
		// payChannel == 'GIFT_CARD_WECHAT' && (payChannel = 'WECHAT_APP')
		// payChannel == 'GIFT_CARD_ALIPAY' && (payChannel = 'ZHIFUBAO_APP')
    // 请求app支付接口
    const nativePayStr = JSON.stringify({ tradeId: tradeId, payChannel: payChannel, device: 'web', version: '1.0.0', sessionId: appInfo.getInfo('session').result });
    window.notifyPayStatus = function (payResult) {
      // 取消支付，停留当前位置等待重新支付
      if (payResult.status == 'FAIL') {
        payResult.message && toast(payResult.message);
        failCallback && failCallback();
      }
      // 支付成功，延时等待第三方支付通知后台
      if (payResult.status == 'OK') {
        successCallback && successCallback();
        !successCallback && setTimeout(() => {
          route('/orderDetail/' + tradeId + '/PAID');
        }, 0);
      }
		};
		const nativeUtil = window.nativeUtil ? window.nativeUtil : window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.nativeUtil;

		// nativeUtil && nativeUtil.commitPay(nativePayStr);
		nativeUtil && nativeUtil.postMessage(JSON.stringify({
			action: 'commitPay',
			data: nativePayStr
		}));
		// post(appInfo.apiPath.payChannel + '&' + appInfo.makeParams({ tradeId: tradeId, channel: payChannel })).then(jsonResult => {
		// 	console.log(jsonResult)
		// })

		!nativeUtil && (() => {
			toast('app之外的渠道支付暂时未开发')
			failCallback && failCallback();
		})()
    // 微信支付
    // !nativeUtil && post(appInfo.apiPath.payChannel + '&' + appInfo.makeParams({ tradeId: tradeId, channel: payChannel })).then(jsonResult => {
    //   const callback = () => {
    //     successCallback && successCallback();
    //     !successCallback && setTimeout(() => {
    //       route('/orderDetail?id='+tradeId+'&status=PAID'); // 延时等待支付结果通知后台
    //     }, 0);
    //   };
    //   if (jsonResult.status != "OK") {
    //     __alert({
    //       message: jsonResult.message,
    //       yes: () => {
    //         failCallback && failCallback();
    //       },
    //       no: () => { failCallback && failCallback()}
    //     });
    //   } else {
    //     // 非微信浏览器微信网页支付
    //     if (!appInfo.liveWechat && payChannel == 'WECHAT_WEB') {
    //       failCallback();
    //       toast('网页微信支付正在开发中，\n暂时请先使用支付宝支付。', 2000);
    //       return;
    //     }
    //     // 支付宝网页支付
    //     payChannel == 'ZHIFUBAO_WEB' && !appInfo.liveAlipay && (window.location.href = '/alipay.html?tradeId=' + tradeId + '&sessionId=' + appInfo.getInfo('session').result);

    //     // 支付宝app支付
    //     payChannel == 'ZHIFUBAO_FTF' && appInfo.liveAlipay && document.addEventListener('AlipayJSBridgeReady', function () {
    //       AlipayJSBridge.call("tradePay", {
    //         tradeNO: jsonResult.result.tradeNo
    //       }, function (result) {
    //         ['9000'].indexOf(result.resultCode) != -1 && callback();
    //         ['4000', '6001', '6002', '99'].indexOf(result.resultCode) != -1 && failCallback();
    //       });
    //       !window.AlipayJSBridge && toast('如果支付失败，请尝试更新支付宝！');
    //     }, false);

    //     // 微信webview支付
    //     payChannel == 'WECHAT_WEB' && wxPay(jsonResult.result, {
    //       success: callback,
    //       cancel: () => {
    //         failCallback && failCallback();
    //       },
    //       fail: () => {
    //         failCallback && failCallback();
    //       }
    //     });
    //   }
    // });

    // (!appInfo.liveWechat && !appInfo.liveAlipay && !nativeUtil) && toast('请使用app或关注微信公众号支付');
  });
}
