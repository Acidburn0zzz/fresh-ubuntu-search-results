'use strict';

console.log('\'Allo \'Allo! Option');

chrome.webNavigation.onCommitted.addListener(function (e) {
  console.log(e);
}, { url: [{ queryContains: 'ubuntu' }] });
//# sourceMappingURL=options.js.map
