'use strict';


const reGoogle = /^https?:\/\/(?:www\.)?google\.com\/(?:webhp|search)/;
chrome.tabs.onUpdated.addListener((id, tab) => {

  if (tab.hasOwnProperty('url') && reGoogle.test(tab.url)) {
    if (tab.url.indexOf('#') !== -1) {
      const [url, _payload] = tab.url.split('#');


      const payload = _payload
        .split('&')
        .reduce((obj, param) => obj.set(...param.split('=')), new Map());

      if (payload.has('q') && payload.get('q').indexOf('ubuntu') !== -1) {
        chrome.pageAction.show(id);

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