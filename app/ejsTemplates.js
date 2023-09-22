'use strict';

const top = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
    <meta name="description" content="<%= description %>" />
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
        rel="stylesheet"
        type="text/css"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700"
        rel="stylesheet"
      />
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
      <title><%= title%></title>
      <script type="importmap">
        {
          "imports": {
            "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
          }
        }
      </script>`;

const bottom = `
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
      <div id="app" class="mt-3"><%- html%></div>
    </div>
    <footer>
      <div class="container py-2">
        <p class="mb-0 text-md-end text-white">
          <strong>&copy; Cheshire East Council</strong>
        </p>
      </div>
    </footer>
  </body>
</html>`;

export {top, bottom};
