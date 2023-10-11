'use strict';

import { renderToString } from 'vue/server-renderer';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import listTemplate from './listTemplate.js';
import { createListApp } from './listApp.js';
import { createEntryApp } from './entryApp.js';
import getSitemap from './getSitemap.js';
import { changeTags, addDates, makePages, sortDate } from './helpers.js';
import { clientApp, schema } from './ejsTemplates.js';
import ejs from 'ejs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public');
const ROOT_URL = `https://cms-chesheast.cloud.contensis.com/`;
const PROJECT = 'website';
const pageSize = 10;
let breadcrumb = "<li class='breadcrumb-item'>Rangers events listing</li>";

const stripP = (str) => {
  return str ? str.replace(/(&nbsp;)?<\/?p[^>]*>/g, '') : '';
};

async function getEntries(req, res) {
  const queries = req.url.split(/\?|&/);
  let entryId = queries.find((k) => k.startsWith('entryId'));
  // Abort if no entryID.
  if (!entryId) {
    res.sendFile(path.join(dir, 'index.html'));
    return;
  } else {
    entryId = entryId.slice(8);
  }

  // Hard-coding this so that the link on leaflets works.
  if (entryId === '00000000-0000-0000-0000-000000000000') {
    entryId = 'ddebbc4f-2d11-4bfa-81f9-6fb19919d7ac';
  }

  // Get the entry from the query string.
  const resp = await fetch(
    `${ROOT_URL}/api/delivery/projects/${PROJECT}/entries/${entryId}/?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
    { method: 'get' }
  );

  // Abort if no data from the CMS.
  if (resp.status !== 200) {
    res.sendFile(path.join(dir, 'index.html'));
    return;
  }

  let item = await resp.json();
  if (item.sys.contentTypeId === 'sitemaps') {
    getSitemap(req, res, item.entryTitle);
    return;
  }

  const title = item.title || '';
  const description = item.excerpt
    ? stripP(item.excerpt)
    : stripP(item.entryDescription);
  const contentType = item.contentTypeAPIName || '';

  // When it's a single entry.
  if (!contentType) {
    let meeting_point = stripP(item.meetingPoint)
      .split(',')
      .map((e) => e.trim());
    let postcode = meeting_point[meeting_point.length - 1]
      .split(' ')
      .slice(0, 2)
      .join(' ');
    let location = meeting_point[0];
    let address1 = meeting_point[1];
    let address2 = meeting_point[2];
    let head_end = ejs.render(schema, {
      title: title,
      description: description,
      leaders: item.leaders,
      image: `https://www.cheshireeast.gov.uk${item.image.asset.sys.uri}`,
      start_date: item.dateStartEnd.from,
      end_date: item.dateStartEnd.to,
      location: location,
      address1: address1,
      address2: address2,
      postcode: postcode,
      price: item.adultTicketPrice,
      pub_date: item.sys.version.published,
    });
    item = changeTags(addDates(item));
    breadcrumb = `<li class='breadcrumb-item'><a href="/rangerevents/listing">Rangers events listing</a></li>
      <li class='breadcrumb-item'>${item.entryTitle}</li>`;
    const entryApp = createEntryApp(item);
    renderToString(entryApp).then((html) => {
      res.render('index', { breadcrumb, description, title, html, head_end });
    });
    return;
  }

  // When it's a listing page.
  const response = await fetch(
    `${ROOT_URL}/api/delivery/projects/${PROJECT}/contenttypes/${contentType}/entries?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
    { method: 'get' }
  );

  // Abort if no data from the CMS.
  if (resp.status !== 200) {
    res.sendFile(path.join(dir, 'index.html'));
    return;
  }

  const data = await response.json();
  let items = data.items.map((e) => addDates(e));
  items = items.map((e) => changeTags(e));
  items.sort(sortDate);
  const { btns, pages } = makePages([...items], pageSize);
  const app = createListApp(items, title, pages, btns, pageSize);
  renderToString(app).then((html) => {
    let head_end = ejs.render(clientApp, {
      items: items,
      title: title,
      pages: pages,
      btns: btns,
      pageSize: pageSize,
      template: listTemplate,
    });
    res.render('index', { breadcrumb, description, title, html, head_end });
  });
}

export default getEntries;
