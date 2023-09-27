'use strict';

import { renderToString } from 'vue/server-renderer';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import listTemplate from './listTemplate.js';
import { createListApp } from './listApp.js';
import { createEntryApp } from './entryApp.js';
import { changeTags, addDates, makePages, sortDate } from './helpers.js';
import { top, bottom, middle } from './ejsTemplates.js';
import ejs from 'ejs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public');
const ROOT_URL = `https://cms-chesheast.cloud.contensis.com/`;
const PROJECT = 'website';
const pageSize = 10;

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
  const title = item.title || '';
  item.description = item.description.replace(/<\/?p[^>]*>/g, '');
  const description = item.description || '';
  const contentType = item.contentTypeAPIName || '';
  const topHtml = ejs.render(top, { description: description, title: title });

  // When it's a single entry.
  if (!contentType) {
    item = changeTags(addDates(item));
    const entryApp = createEntryApp(item);
    renderToString(entryApp).then((html) => {
      res.send(`${topHtml}${ejs.render(bottom, { html: html })}`);
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
    res.send(
      `${topHtml}${ejs.render(middle, {
        items: items,
        title: title,
        pages: pages,
        btns: btns,
        pageSize: pageSize,
        template: listTemplate,
      })}${ejs.render(bottom, { html: html })}`
    );
  });
}

export default getEntries;
