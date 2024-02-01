'use strict';

import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import listTemplate from './listTemplate.js';
import { createEntryApp } from './entryApp.js';
import getSitemap from './getSitemap.js';
import {
  prettyDate,
  stripP,
  changeTags,
  addDates,
  makePages,
  sortDate,
} from './helpers.js';
import { appInner, appOuter, schema } from './ejsTemplates.js';
import ejs from 'ejs';
import {
  includes,
  reachdeck,
  header,
  footer,
  cookies,
  site_search,
  feedback,
} from 'cec-block-templates';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public');
const ROOT_URL = `https://cms-chesheast.cloud.contensis.com/`;
const PROJECT = 'website';
const pageSize = 10;
const breadcrumb = "<li class='breadcrumb-item'>Rangers events listing</li>";

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
    // Adding the structured data for Google Events.
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
    let bc = `<li class='breadcrumb-item'><a href="/rangerevents/listing">Rangers events listing</a></li>
      <li class='breadcrumb-item'>${item.entryTitle}</li>`;
    let item_path = item.sys.uri;
    let published = prettyDate(new Date(item.sys.version.published));
    let myFeedback = ejs.render(feedback, { published, item_path, title });
    const entryApp = createEntryApp(item);
    renderToString(entryApp).then((html) => {
      res.render('index', {
        includes,
        cookies,
        header,
        footer,
        site_search,
        reachdeck,
        breadcrumb: bc,
        description,
        title,
        html,
        head_end,
        feedback: myFeedback,
      });
    });
    return;
  }

  // When it's a listing page.
  const response = await fetch(
    `${ROOT_URL}/api/delivery/projects/${PROJECT}/contenttypes/${contentType}/entries?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I&pageSize=1000`,
    { method: 'get' }
  );
  // Abort if no data from the CMS.
  if (resp.status !== 200) {
    res.sendFile(path.join(dir, 'index.html'));
    return;
  }
  // Get the data
  const data = await response.json();
  let items = data.items.map((e) => addDates(e));
  items = items.map((e) => changeTags(e));
  items.sort(sortDate);
  const { btns, pages } = makePages([...items], pageSize);
  let item_path = item.sys.uri;
  let published = prettyDate(new Date(item.sys.version.published));
  let myFeedback = ejs.render(feedback, { published, item_path, title });
  // Create the app body by injecting the template.
  const appBody = ejs.render(appInner, { template: listTemplate });

  // Use this to create script tags to be added in the head element.
  let head_end = ejs.render(appOuter, {
    appBody,
    items,
    title,
    pages,
    btns,
    pageSize,
  });

  // Create a function with the app body.
  const createListApp = new Function(
    'items, title, pages, btns, pageSize, createSSRApp',
    appBody
  );

  // Make an instance of that function, with the data we need.
  const app = createListApp(items, title, pages, btns, pageSize, createSSRApp);

  // Render and send to client.
  renderToString(app).then((html) => {
    res.render('index', {
      includes,
      cookies,
      header,
      footer,
      site_search,
      reachdeck,
      breadcrumb,
      description,
      title,
      html,
      head_end,
      feedback: myFeedback,
    });
  });
}

export default getEntries;
