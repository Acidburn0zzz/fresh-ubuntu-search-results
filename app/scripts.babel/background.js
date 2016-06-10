import { parse as qParse, stringify as qStringify } from 'query-string';
import { parse as urlParse, format as urlFormat } from 'url';
import _ from 'lodash';

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
      const parsed = urlParse(tab.url);

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
      chrome.tabs.update(tabId, { url: urlFormat(parsed) });
    });
  };
}

function freshen(query, keyword) {
  // parse query
  const parsed = qParse(query) || {};
  const options = { strict: false };

  // Guard, uninteresting, no q
  if (_.isUndefined(parsed.q)) return [qStringify(parsed, options), false];

  // Guard, uninteresting, not searching ubuntu
  if (!parsed.q.includes(keyword)) return [qStringify(parsed, options), false];

  // Guard, tbas/tbs is set (aka user manually removed/changed filter)
  if (parsed.tbas || parsed.tbs) return [qStringify(parsed, options), false];

  // set filter to 'past year'
  parsed.tbs = 'qdr:y';

  // return query
  return [qStringify(parsed, options), true];
}
