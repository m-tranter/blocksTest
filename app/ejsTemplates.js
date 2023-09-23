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
    </head>
  `;

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

const middle = `
      <script type="importmap">
        {
          "imports": {
            "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js"
          }
        }
      </script>
    <script type="module">
      import { createSSRApp } from 'vue';
      function createApp(items) {
        return createSSRApp({
          data: () => ({
          h1: "<%= title %>",
          pages: <%- JSON.stringify(pages) %>,
          copyItems: <%- JSON.stringify(items) %>,
          categoriesChecked: [],
          pageIndex: 0,
          totalCount: <%= items.length %>,
          pageSize: <%= pageSize %>,
          pageCount: <%= btns.length %>,
          pageBtns: <%- JSON.stringify(btns) %>,
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
            this.searchedItems.sort(this.sortDate);
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
          template: \`<%- template %>\`,
        })
      };
    createApp().mount('#app');
    </script>
  </head>`;

export { top, bottom, middle };
