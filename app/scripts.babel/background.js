'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(tabId => {
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

const reGoogle = /^https?:\/\/(?:www\.)?google\.com\/(?:webhp|search)/;
chrome.tabs.onUpdated.addListener((id, tab) => {

  if (tab.hasOwnProperty('url') && reGoogle.test(tab.url)) {
    if (tab.url.indexOf('#') !== -1) {
      const [url, _payload] = tab.url.split('#');


      const payload = _payload
        .split('&')
        .reduce((obj, param) => obj.set(...param.split('=')), new Map());

      if (payload.has('q') && payload.get('q').indexOf('ubuntu') !== -1) {

        if (payload.has('tbs') || payload.has('tbas')) {
          return;
        } else {
          payload.set('tbs', 'qdr:y');
        }

        const destination = url + '#' + [...payload.entries()]
            .map((params) => params.join('='))
            .join('&');

        console.log('tab.url    ', tab.url);
        console.log('destination', destination);
        chrome.tabs.update(id, {url: destination});
      }

    }
  }
});