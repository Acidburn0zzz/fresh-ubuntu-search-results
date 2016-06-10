const { parse, stringify } = require('query-string');
const url = require('url');
const isEmpty = require('lodash/isEmpty');
const isUndefined = require('lodash/isUndefined');

chrome.tabs.onUpdated.addListener(handleUpdate);

const VALID = {
  hosts: ['www.google.com'],
  pathnames: ['/webhp', '/search', '/'],
  keyword: 'ubuntu',
};

function handleUpdate(tabId, changeInfo) {
  // Guard, url not changed
  if (isUndefined(changeInfo) || isUndefined(changeInfo.url)) return;

  // parse url
  const parsed = url.parse(changeInfo.url);

  // Guard, is not www.google.com
  if (!VALID.hosts.includes(parsed.host)) return;

  // Guard, is not search page
  if (!VALID.pathnames.includes(parsed.pathname)) return;

  chrome.pageAction.show(tabId);

  // freshen queries
  parsed.search = `?${freshen(parsed.search)}`;
  parsed.hash = `#${freshen(parsed.hash)}`;

  // update url
  chrome.tabs.update(tabId, { url: url.format(parsed) });
}

function freshen(query) {
  // parse query
  const parsed = parse(query);

  // Guard, uninteresting
  if (isEmpty(parsed) || isUndefined(parsed.q)) return stringify(parsed);

  // Guard, uninteresting
  if (!parsed.q.includes(VALID.keyword)) return stringify(parsed);

  // Guard, tbas is set (aka user manually removed filter)
  if (parsed.tbas) return stringify(parsed);

  // set filter to 'past year'
  parsed.tbs = parsed.tbs || 'qdr:y';

  // return query
  return stringify(parsed);
}
