'use strict';

import express from 'express';
import { renderToString } from 'vue/server-renderer';
import { createListApp } from './listApp.js';
import { createEntryApp } from './entryApp.js';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import listTemplate from './listTemplate.js';
import entryTemplate from './entryTemplate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../public');
const server = express();
const port = 3001;
const ROOT_URL = `https://cms-chesheast.cloud.contensis.com/`;
const PROJECT = 'website';
const pageSize = 10;

async function getEntries(req, res) {
  // Needed to set up pages server-side.
  const makePages = (arr) => {
    let count = arr.length;
    let pageCount = Math.ceil(count / pageSize);
    let btns = Array.from({ length: pageCount }, (_, i) => i + 1);
    let pages = [...Array(pageCount)].map(() => arr.splice(0, pageSize));
    return { btns, pages };
  };

  // Find query string.
  const queries = req.url.split(/\?|&/);
  let entryId = queries.find((k) => k.startsWith('entryId'));
  entryId = entryId && entryId.slice(8);

  // No entry id in query string.
  if (!entryId) {
    res.sendFile(path.join(dir, 'index.html'));
    return;
  }

  // Try to get an entry.
  const resp = await fetch(
    `${ROOT_URL}/api/delivery/projects/${PROJECT}/entries/${entryId}/?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
    { method: 'get' }
  );

  // Failed to get an entry.
  if (resp.status !== 200) {
    res.sendFile(path.join(dir, 'index.html'));
    return;
  }

  const item = await resp.json();
  const title = item.title || '';
  const description = item.description || '';
  const contentType = item.contentTypeAPIName || '';

  // Not a listing page - just send the selected item app & template.
  if (!contentType) {
    const entryApp = createEntryApp(item);
    const itemStr = JSON.stringify(item);
    renderToString(entryApp).then((html) => {
      res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="${description}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD"
      crossorigin="anonymous"
    />
    <link
      href="https://www.cheshireeast.gov.uk/siteelements/css/bs5/400-cec-styles.css"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://www.cheshireeast.gov.uk/SiteElements/css/bs5/600-events-vue-axios.css"
"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700"
      rel="stylesheet"
    />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <title>${title}</title>
    <script type="importmap">
      {
        "imports": {
          "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
        }
      }
    </script>
    <script type="module">
        import { createSSRApp } from 'vue';
        function createApp(items) {
          return createSSRApp({
            data: () => ({
            item: ${itemStr},
            dateOptions: {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            },
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
            formatDate: function (value) {
              return ' ' + new Date(value).toLocaleString('en-GB', this.dateOptions);
            },
            getTime: function (value) {
              let time = new Date(value).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });

              console.log(time);
              if (time === '0:00 pm') {
                return ' 12 noon';
              } else if (time.startsWith('0')) {
                time = '12' + time.slice(1);
              }
              return ' ' + time.replace(' ', '').toLowerCase();
            },
          },
            template: '${entryTemplate}',
          })
        };
      createApp().mount('#app');
    </script>
  </head>
  <body>
    <header class="cec-header">
      <div class="container">
        <a
          class="navbar-brand border border-0 border-secondary"
          title="Home"
          href="https://www.cheshireeast.gov.uk/home.aspx"
        >
          <img
            title="Home page"
            alt="Cheshire East Council home page"
            height="70"
            width="155"
            src="https://www.cheshireeast.gov.uk/images/non_user/cec-logo-colour-155x70px.png"
          />
          <span class="visually-hidden"
            >Cheshire East Council website home page</span
          ></a
        >
      </div>
    </header>
    <div class="container mt-3">
      <div id="app" class="mt-3">${html}</div>
    </div>
    <footer>
      <div class="container py-2">
        <p class="mb-0 text-md-end text-white">
          <strong>&copy; Cheshire East Council</strong>
        </p>
      </div>
    </footer>
  </body>
</html>
      `);
    });
    return;
  }

  // It's a listing page.
  const response = await fetch(
    `${ROOT_URL}/api/delivery/projects/${PROJECT}/contenttypes/${contentType}/entries?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
    { method: 'get' }
  );
  const data = await response.json();
  const items = data.items;
  const { btns, pages } = makePages([...items]);
  const itemsStr = JSON.stringify(items);
  const pagesStr = JSON.stringify(pages);
  const btnStr = JSON.stringify(btns);
  const app = createListApp(items, title, pages, btns, pageSize);
  renderToString(app).then((html) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content="${description}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css"
      rel="stylesheet"
      integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD"
      crossorigin="anonymous"
    />
    <link
      href="https://www.cheshireeast.gov.uk/siteelements/css/bs5/400-cec-styles.css"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://www.cheshireeast.gov.uk/SiteElements/css/bs5/600-events-vue-axios.css"
"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700"
      rel="stylesheet"
    />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
    <title>${title}</title>
    <script type="importmap">
      {
        "imports": {
          "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
        }
      }
    </script>
    <script type="module">
        import { createSSRApp } from 'vue';
        function createApp(items) {
          return createSSRApp({
            data: () => ({
            h1: "${title}",
            pages: ${pagesStr},
            copyItems: ${itemsStr},
            categoriesChecked: [],
            rxDate: /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2})?(?:\.\d*)?Z?$/,
            dateOptions: {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            },
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
            formatDate: function (value) {
              return ' ' + new Date(value).toLocaleString('en-GB', this.dateOptions);
            },
            getTime: function (value) {
              let time = new Date(value).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
              if (time === '0:00 pm') {
                return ' 12 noon';
              } else if (time.startsWith('0')) {
                time = '12' + time.slice(1);
              }
              return ' ' + time.replace(' ', '').toLowerCase();
            },
            click_me:function(id) {
              document.getElementById(id).click();
            },
          },
          mounted() {
            this.copyItems.forEach(elem => elem.tags = elem.tags.map(e => e.name));
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
  <body>
    <header class="cec-header">
      <div class="container">
        <a
          class="navbar-brand border border-0 border-secondary"
          title="Home"
          href="https://www.cheshireeast.gov.uk/home.aspx"
        >
          <img
            title="Home page"
            alt="Cheshire East Council home page"
            height="70"
            width="155"
            src="https://www.cheshireeast.gov.uk/images/non_user/cec-logo-colour-155x70px.png"
          />
          <span class="visually-hidden"
            >Cheshire East Council website home page</span
          ></a
        >
      </div>
    </header>
    <div class="container mt-3">
      <div id="app" class="mt-3">${html}</div>
    </div>
    <footer>
      <div class="container py-2">
        <p class="mb-0 text-md-end text-white">
          <strong>&copy; Cheshire East Council</strong>
        </p>
      </div>
    </footer>
  </body>
</html>
      `);
  });
}

server.listen(port, (error) => {
  if (!error) {
    console.log(`\nServer running on port ${port}.`);
  } else {
    console.log(error);
  }
});

// Log all requests to the server.
const myLogger = function (req, _, next) {
  console.log(`Incoming: ${req.url}`);
  next();
};

// Middleware
server.use(express.json());
server.use(myLogger);

// Custom route handler for serving JavaScript and CSS files
server.get(/.*\.(js|css)$/, (req, res) => {
  const filePath = path.join(dir, req.url);
  res.sendFile(filePath);
});

server.get('*', (req, res) => {
  getEntries(req, res);
});
