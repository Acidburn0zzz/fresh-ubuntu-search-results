'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(function (tabId) {
  chrome.pageAction.show(tabId);
});

//chrome.webRequest.onBeforeRequest.addListener(request => {
//  if (request.url.indexOf('?') !== -1) {
//    let seperator;
//    if (request.url.split('?')[0].endsWith('webhp')) {
//      seperator = '#';
//    } else {
//      seperator = '?';
//    }
//    if (request.url.indexOf(seperator) === -1) {
//      return;
//    }
//
//    const url = request.url.split(seperator)[0];
//    const payload = request.url
//      .split(seperator)[1]
//      .split('&')
//      .reduce((obj, param) => obj.set(...param.split('=')), new Map());
//
//    if (payload.has('tbs')) {
//      payload.set('tbs', 'qdr:y');
//    }
//    console.log('payload', payload);
//
//
//    const payloadString = [...payload.entries()]
//      .map((params) => params.join('='))
//      .join('&');
//
//    console.log('redirecting to', url + seperator + payloadString);
//
//
//    return {redirectUrl: url + seperator + payloadString};
//
//  }
//}, {urls: ['*://*.google.com/search*']}, ['blocking']);

var reGoogle = /^https?:\/\/(?:www\.)?google\.com\/(?:webhp|search)/;
chrome.tabs.onUpdated.addListener(function (id, tab) {

  if (tab.hasOwnProperty('url') && reGoogle.test(tab.url)) {
    if (tab.url.indexOf('#') !== -1) {
      var _tab$url$split = tab.url.split('#');

      var _tab$url$split2 = _slicedToArray(_tab$url$split, 2);

      var url = _tab$url$split2[0];
      var _payload = _tab$url$split2[1];

      var payload = _payload.split('&').reduce(function (obj, param) {
        return obj.set.apply(obj, _toConsumableArray(param.split('=')));
      }, new Map());

      if (payload.has('q') && payload.get('q').indexOf('ubuntu') !== -1) {

        if (payload.has('tbs') || payload.has('tbas')) {
          return;
        } else {
          payload.set('tbs', 'qdr:y');
        }

        var destination = url + '#' + [].concat(_toConsumableArray(payload.entries())).map(function (params) {
          return params.join('=');
        }).join('&');

        console.log('tab.url    ', tab.url);
        console.log('destination', destination);
        chrome.tabs.update(id, { url: destination });
      }
    }
  }
});
//# sourceMappingURL=background.js.map
