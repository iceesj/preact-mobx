let lastNoticeTime = 0; // 上次提醒时间标记，防止连续提醒

const _fetch = (url, options) => {

  const reqTimeoutHash = (+new Date) + '' + Math.random();
  const netWeakWait = 10 * 1000; // 超时等待时间

  _fetch[reqTimeoutHash] = true;

  // 超时提醒，提醒间隔为超时等待时间, POST 等待时间为 GET 请求的 2 倍
  setTimeout(() => {
    const nowTime = +new Date;
    if (!_fetch[reqTimeoutHash])
      return;
    delete _fetch[reqTimeoutHash];
    const showNotice = nowTime - lastNoticeTime > netWeakWait;
    showNotice && (window.toast || alert)('您的网络似乎有点问题');
    lastNoticeTime = showNotice ? nowTime : lastNoticeTime;
  }, netWeakWait * (options.method == 'POST' ? 2 : 1));

  options.mode = 'cors'; // 服务器支持跨域可用

  return fetch(url, options).then(function (res) {
    delete _fetch[reqTimeoutHash];
    return res;
  })
}

// json解析出错，保留原始数据 {_res: res}
const jsonParse = (res) => {
  return res.text().then((resText) => {
    let jsonRes, failRes, resError = false;
    try {
      jsonRes = JSON.parse(resText);
    } catch (e) {
      resError = true;
      failRes = {
        status: 'ERROR',
        message: '请求数据错误',
        _res: res
      };
    }
    return resError ? failRes : jsonRes;
  });
};

// get 请求，默认 json 解析，制定 text 返回 字符串，其他格式返回 原始数据
export function get(url, type = 'json') {
  const _res = _fetch(url, {
    method: 'GET'
  });
  if (type == 'json')
    return _res.then(jsonParse);
  if (type == 'text')
    return _res.then(res => res.text());
  return _res;
}

// post 请求，默认使用 form 提交，默认使用 json 解析
export function post(url, data, type = 'json', withForm = true) {
  data = data || {};
  const formData = new FormData();
  if (withForm) {
    for (const key in data) {
      formData.append(key, data[key]);
    }
  }
	const _res = withForm ? _fetch(url, {
    method: 'POST',
    body: formData
  }) : _fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      "Content-Type":"application/json"
    }
  });
  if (type == 'json')
    return _res.then(jsonParse);
  if (type == 'text')
    return _res.then(res => res.text());
  return _res;
}

/**
 * 把对象拼接成get参数的字符串
 * @param {传入需要拼接的参数以对象的方式} obj
 */
export function makeParams(obj){
  let key;
  let paramStr = '';
  for (key in obj) {
    paramStr += (paramStr && '&' || '') + key + '=' + obj[key];
  }
  return paramStr;
}
