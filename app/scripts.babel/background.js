'use strict';
/*
* CREDITS:
* Umbrella icon by Jerry Low https://www.iconfinder.com/jerrylow
* */


// match http{s,}://{www.,}google.com/{webhp,search}*
// ie https://www.google.com/webhp
const reGoogle = /^https?:\/\/(?:www\.)?google\.com\/(?:webhp|search)/;

/*
 * callback:
 * id: browser tab identifier
 * tab: object containing updated tab info
 * */
chrome.tabs.onUpdated.addListener((id, tab) => {

  /*
   * `tab.url` only exists IF url is changed.
   * */
  // IF url changed and is a google search
  if (tab.hasOwnProperty('url') && reGoogle.test(tab.url)) {
    // IF url has a query string.
    if (tab.url.indexOf('#') !== -1) {
      const [url, _payload] = tab.url.split('#');

      // parse payload into `Map` object
      const payload = _payload
        .split('&')
        .reduce((obj, param) => obj.set(...param.split('=')), new Map());

      // If `q` exists and contains ubuntu
      if (payload.has('q') && payload.get('q').indexOf('ubuntu') !== -1) {
        //show the sweet `pageAction` icon in the address bar.
        chrome.pageAction.show(id);

        /*
         * Payload param `tbas=0` means filter "all time"; allowing user to
         * forcefully override this extension.
         * */
        // IF the date filter is already set, exit. ELSE set to 'last year'.
        if (payload.has('tbs') || payload.has('tbas')) {
          return;
        } else {
          payload.set('tbs', 'qdr:y');
        }

        // Compile the destination url with filter parameter.
        const destination = url + '#' + [...payload.entries()]
            .map((params) => params.join('='))
            .join('&');

        // Update the tab with new url.
        chrome.tabs.update(id, {url: destination});
      }

    }
  }
});