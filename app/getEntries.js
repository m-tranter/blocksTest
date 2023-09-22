'use strict';

import { renderToString } from 'vue/server-renderer';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import listTemplate from './listTemplate.js';
import entryTemplate from './entryTemplate.js';
import { createListApp } from './listApp.js';
import { createEntryApp } from './entryApp.js';
import { changeTags, addDates, makePages } from './helpers.js';
import { top, bottom } from './ejsTemplates.js';
import ejs from 'ejs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public');
const ROOT_URL = `https://cms-chesheast.cloud.contensis.com/`;
const PROJECT = 'website';
const pageSize = 10;

async function getEntries(req, res) {
  const queries = req.url.split(/\?|&/);
  let entryId = queries.find((k) => k.startsWith('entryId'));

  if (!entryId) {
    res.sendFile(path.join(dir, 'index.html'));
    return;
  }

  // Get the entry from the query string.
  const resp = await fetch(
    `${ROOT_URL}/api/delivery/projects/${PROJECT}/entries/${entryId.slice(
      8
    )}/?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
    { method: 'get' }
  );

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
    const itemStr = JSON.stringify(item);
    renderToString(entryApp).then((html) => {
      res.send(`${topHtml}
        <script type="module">
            import { createSSRApp } from 'vue';
            function createApp(items) {
              return createSSRApp({
                data: () => ({
                item: ${itemStr},
              }),
              methods: {
                prefix: function(str) {
                  return "https://www.cheshireeast.gov.uk" + str;
                },
                gmap: function (item) {
                  return (
                    'https://maps.google.com/maps?q=' +
                    item.mapLocation.lat +
                    ',' +
                    item.mapLocation.lon
                  );
                },
              },
                template: '${entryTemplate}',
              })
            };
          createApp().mount('#app');
        </script>
      </head>
      ${ejs.render(bottom, { html: html })}
      `);
    });
    return;
  }

  // When it's a listing page.
  const response = await fetch(
    `${ROOT_URL}/api/delivery/projects/${PROJECT}/contenttypes/${contentType}/entries?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
    { method: 'get' }
  );
  const data = await response.json();
  let items = data.items.map((e) => addDates(e));
  items = items.map((e) => changeTags(e));
  const { btns, pages } = makePages([...items], pageSize);
  const itemsStr = JSON.stringify(items);
  const pagesStr = JSON.stringify(pages);
  const btnStr = JSON.stringify(btns);
  const app = createListApp(items, title, pages, btns, pageSize);
  renderToString(app).then((html) => {
    res.send(`${topHtml}
        <script type="module">
            import { createSSRApp } from 'vue';
            function createApp(items) {
              return createSSRApp({
                data: () => ({
                h1: "${title}",
                pages: ${pagesStr},
                copyItems: ${itemsStr},
                categoriesChecked: [],
                pageIndex: 0,
                totalCount: ${items.length},
                pageSize: ${pageSize},
                pageCount: ${btns.length},
                pageBtns: ${btnStr},
                searchFields: ['title', 'description'],
                searchAlert: false,
                searchTerm: '',
                lastSearch: '',
                fromDate: '',
                toDate: '',
                filterField: 'tags',
                categories: [
                  'Bring a packed lunch',
                  'Bring binoculars if you have them',
                  'Car parking charge',
                  'Children must be accompanied by an adult',
                  'Easy walking grade',
                  'Full accessibility - level or ramped access. Accessible toilets available',
                  'Healthy walk / Event',
                  'Historial walk / Event',
                  'Ideal for families and accompanied children',
                  'Moderate walking grade',
                  'Partial accessibility - level or ramped access',
                  'Partnership event',
                  'Places limited - please book in advance',
                  'Please leave your dog at home',
                  'Please wear suitable boots and clothing',
                  'Refreshment shop, opportunity for refreshments',
                  'Strenuous walking grade',
                  'There is a charge for this event',
                  'Wildlife walk / Event',
                ],
              }),
              methods: {
                cardLink: function(item) { return "/rangerevents/" + item.sys.slug.slice(0,-5);
                },
                clearAlert: function () {
                  this.searchAlert = false;
                },
                prefix: function(str) {
                  return "https://www.cheshireeast.gov.uk" + str;
                },
                searchFilter: function () {
                  let fromDate = this.fromDate.length > 0 ? new Date(this.fromDate) : false;
                  let toDate = this.toDate.length > 0 ? new Date(this.toDate) : false;
                  this.searchedItems = this.filteredItems.filter((item) =>
                    this.searchFields.some((term) => {
                      return (
                        (!this.searchTerm ||
                          item[term]
                          .toLowerCase()
                          .includes(this.searchTerm.toLowerCase())) &&
                        (!fromDate || item.dateStartEnd.to > fromDate) &&
                        (!toDate || item.dateStartEnd.to < toDate)
                      );
                    }),
                  );
                  this.calculatePages();
                },
                filterByCategories: function () {
                  if (this.categoriesChecked.length === 0) {
                    this.filteredItems = this.copyItems.slice();
                  } else {
                    this.filteredItems = this.copyItems.filter((elem) =>
                      this.categoriesChecked.every(c => elem[this.filterField].includes(c)));
                  }
                  this.searchFilter();
                },
                resetSearch: function () {
                  this.searchTerm = '';
                  this.fromDate = '';
                  this.toDate = '';
                  this.searchedItems = this.filteredItems.slice();
                  this.calculatePages();
                },
                calculatePages: function () {
                  this.totalCount = this.searchedItems.length;
                  this.pageCount = Math.ceil(this.totalCount / this.pageSize);
                  this.pageIndex = 0;
                  this.pageBtns = Array.from({ length: this.pageCount }, (_, i) => i + 1);
                  this.createPages();
                  this.items = this.pages[0];
                  document.getElementById('contentTypesContainer').scrollIntoView();
                  },
                  createPages: function () {
                  this.pages = [
                    ...Array(Math.ceil(this.searchedItems.length / this.pageSize)),
                  ].map(() => this.searchedItems.splice(0, this.pageSize));
                },
                goToPage: function (i) {
                  document.getElementById('contentTypesContainer').scrollIntoView();
                  this.pageIndex = i;
                  this.lastSearch = this.searchTerm;
                },
                applyFilters: function (cat) {
                  const index = this.categoriesChecked.indexOf(cat);
                  if (index > -1) {
                    this.categoriesChecked.splice(index, 1);
                  } else {
                    this.categoriesChecked.push(cat);
                  }
                  this.filterByCategories();
                  this.searchFilter();
                },
                click_me:function(id) {
                  document.getElementById(id).click();
                },
              },
              mounted() {
                this.copyItems = this.copyItems.map(e => {
                  e.dateStartEnd.to = new Date(e.dateStartEnd.to);
                  e.dateStartEnd.from = new Date(e.dateStartEnd.from);
                  return e;
                });
                this.filteredItems = this.copyItems.slice();
                this.searchedItems = this.copyItems.slice();
                this.calculatePages();
              },
                template: '${listTemplate}',
              })
            };
          createApp().mount('#app');
        </script>
      </head>
      ${ejs.render(bottom, { html: html })}
      `);
  });
}

export default getEntries;
