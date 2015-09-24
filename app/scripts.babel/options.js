'use strict';

console.log('\'Allo \'Allo! Option');

chrome.webNavigation.onCommitted.addListener((e) => {
  console.log(e);
}, {url:[{queryContains:'ubuntu'}]});