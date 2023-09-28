'use strict';
import listTemplate from './listTemplate.js';
import { createSSRApp } from 'vue';

export function createListApp(items, title, pages, btns, pageSize) {
  return createSSRApp({
    data: () => ({
      h1: title,
      loaded: false,
      pages: pages,
      copyItems: items,
      categoriesChecked: [],
      pageIndex: 0,
      totalCount: items.length,
      pageSize: pageSize,
      pageCount: btns.length,
      pageBtns: btns,
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
      clearAlert: function () {
        this.searchAlert = false;
      },
      cardLink: function (item) {
        return '/rangerevents/' + item.sys.slug.slice(0, -5);
      },
      searchFilter: function () {
        let fromDate =
          this.fromDate.length > 0 ? new Date(this.fromDate) : false;
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
          })
        );
        this.searchedItems.sort(this.sortDate);
        this.calculatePages();
      },
      filterByCategories: function () {
        if (this.categoriesChecked.length === 0) {
          this.filteredItems = this.copyItems.slice();
        } else {
          this.filteredItems = this.copyItems.filter((elem) =>
            this.categoriesChecked.every((c) =>
              elem[this.filterField].includes(c)
            )
          );
        }
        this.searchFilter();
      },
      resetSearch: function () {
        this.categoriesChecked = [];
        this.categories.forEach(
          (e) => (document.getElementById(e).checked = false)
        );
        this.searchTerm = '';
        this.fromDate = '';
        this.toDate = '';
        this.searchedItems = this.copyItems.slice();
        this.calculatePages();
      },
      calculatePages: function () {
        this.totalCount = this.searchedItems.length;
        this.pageCount = Math.ceil(this.totalCount / this.pageSize);
        this.pageIndex = 0;
        this.pageBtns = Array.from({ length: this.pageCount }, (_, i) => i + 1);
        this.createPages();
        this.items = this.pages[0];
        if (this.loaded) {
          document.getElementById('contentTypesContainer').scrollIntoView();
        } else {
          this.loaded = true;
        }
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
      click_me: function (id) {
        document.getElementById(id).click();
      },
      sortDate: function (a, b) {
        return a.dateStardEnd.from - b.dateStartEnd.from;
      },
    },
    mounted() {
      this.copyItems = this.copyItems.map((e) => {
        e.dateStartEnd.to = new Date(e.dateStartEnd.to);
        e.dateStartEnd.from = new Date(e.dateStartEnd.from);
        return e;
      });
      this.filteredItems = this.copyItems.slice();
      this.searchedItems = this.copyItems.slice();
      this.calculatePages();
    },
    template: listTemplate,
  });
}
