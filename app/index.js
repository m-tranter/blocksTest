'use strict';

import express from 'express';
import path from 'path';
import { renderToString } from 'vue/server-renderer';
import { createApp } from './app.js';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = express();
const dir = path.join(__dirname, '../public');
const port = 3001;
const ROOT_URL = `https://cms-chesheast.cloud.contensis.com/`;
const PROJECT = 'website';

async function getEntries(req, res) {
  /*
   *const response = await fetch(
   *  `${ROOT_URL}/api/delivery/projects/${PROJECT}/contenttypes/rangerEvents/entries?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
   *  { method: 'get' }
   *);
   *const data = await response.json();
   *console.log(data.items ? `Got ${data.items.length} entries.` : 'No data.');
   */
  const queries = req.url.split(/\?|&/);
  let entryId = queries.find((k) => k.startsWith('entryId'));
  let nodeId = queries.find((k) => k.startsWith('nodeId'));
  entryId = entryId && entryId.slice(8);
  nodeId = nodeId && nodeId.slice(7);
  let title = "Title";
  let description = "Description";
  let contentType;

  if (entryId) {
   const res = await fetch(
     `${ROOT_URL}/api/delivery/projects/${PROJECT}/entries/${entryId}/?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
     { method: 'get' }
   );
   const data = await res.json();
    title = data.title ? data.title : title;
    description = data.description ? data.description : description; 
    contentType = data.contentTypeAPIName ? data.contentTypeAPIName : '';
  }
  

  /*
   *const app = createApp(data.items);
   *let items = JSON.stringify(data.items);
   */
  const app = createApp();
  let items = JSON.stringify([]);

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
            data: () => ({ items: ${items} }),
            template: '<div><h2>List of events</h2><p v-for="item in items">{{item.entryTitle}}</p></div>',
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
      <h1>${title}</h1>
      <p class="mb-0">Node Id: ${nodeId ? nodeId : "Not found"}</p>
      <p>Entry Id: ${entryId ? entryId : "Not found."}</p>
      <p>Content Type: ${contentType ? contentType : "Not found"}</p>
      <hr />
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

server.get('/*', (req, res) => {
  getEntries(req, res);
});
