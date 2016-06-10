const { parse, stringify } = require('query-string');
const url = require('url');
const _ = require('lodash');

const RULES = [{
  host: 'www.google.com',
  pathnames: ['/webhp', '/search', '/'],
  keyword: 'ubuntu',
}];

chrome.tabs.onUpdated.addListener(addRules(RULES));

function addRules(ruleList, callback = _.identity) {
  const rules = callback(ruleList);

  return (tabId, changeInfo, tab) => {
    rules.forEach(({ host, pathnames, keyword }) => {
      // Guard, is not www.google.com || ubuntu not in url
      if (!(tab.url.includes(host) && tab.url.includes(keyword))) return;

      // parse url
      const parsed = url.parse(tab.url);

      // Guard, is not www.google.com (more accurate) || not search page i.e. /search
      if (!(parsed.host === host && pathnames.includes(parsed.pathname))) return;

      // show page action icon
      chrome.pageAction.show(tabId);

      // Guard, url not changed
      if (_.isUndefined(changeInfo.url)) return;

      // freshen query strings
      const [search, searchUpdated] = freshen(parsed.search, keyword);
      const [hash, hashUpdated] = freshen(parsed.hash, keyword);

      // Guard, no update required
      if (!(searchUpdated || hashUpdated)) return;

      // update url components
      parsed.search = `?${search}`;
      parsed.hash = `#${hash}`;

      // update url
      chrome.tabs.update(tabId, { url: url.format(parsed) });
    });
  };
}

function freshen(query, keyword) {
  // parse query
  const parsed = parse(query) || {};
  const options = { strict: false };

  // Guard, uninteresting, no q
  if (_.isUndefined(parsed.q)) return [stringify(parsed, options), false];

  // Guard, uninteresting, not searching ubuntu
  if (!parsed.q.includes(keyword)) return [stringify(parsed, options), false];

  // Guard, tbas/tbs is set (aka user manually removed/changed filter)
  if (parsed.tbas || parsed.tbs) return [stringify(parsed, options), false];

  // set filter to 'past year'
  parsed.tbs = 'qdr:y';

  // return query
  return [stringify(parsed, options), true];
}
