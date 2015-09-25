'use strict';


const reGoogle = /^https?:\/\/(?:www\.)?google\.com\/(?:webhp|search)/;
chrome.tabs.onUpdated.addListener((id, tab) => {

  // tab.url only exists IF url is changed.
  if (tab.hasOwnProperty('url') && reGoogle.test(tab.url)) {
    // IF url has a query string.
    if (tab.url.indexOf('#') !== -1) {
      const [url, _payload] = tab.url.split('#');

      // parse payload into `Map` object
      const payload = _payload
        .split('&')
        .reduce((obj, param) => obj.set(...param.split('=')), new Map());

      // If `q` contains ubuntu
      if (payload.has('q') && payload.get('q').indexOf('ubuntu') !== -1) {
        chrome.pageAction.show(id);

        /*
         * Payload param `tbas=0` means filter "all time"; allowing user to forcefully override this extension.
         *
         * */
        // IF has date filter, exit.
        if (payload.has('tbs') || payload.has('tbas')) {
          return;
        } else {
          payload.set('tbs', 'qdr:y');
        }

        // compile the destination url with filter parameter.
        const destination = url + '#' + [...payload.entries()]
            .map((params) => params.join('='))
            .join('&');

        // Update the tab with new url.
        chrome.tabs.update(id, {url: destination});
      }

    }
  }
});