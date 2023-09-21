import listTemplate from './listTemplate.js';
import { createSSRApp } from 'vue';

export function createListApp(items, title, pages, btns, pageSize) {
  return createSSRApp({
    data: () => ({
      h1: title,
      pages: pages,
      copyItems: items,
      categoriesChecked: [],
      rxDate: /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2})?(?:\.\d*)?Z?$/,
      dateOptions: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
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
      prefix: function (str) {
        return 'https://www.cheshireeast.gov.uk' + str;
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
          return '12 noon';
        } else if (time.startsWith('0')) {
          time = '12' + time.slice(1);
        }
        return ' ' + time.replace(' ', '').toLowerCase();
      },
      click_me: function (id) {
        document.getElementById(id).click();
      },
    },
    mounted() {
      this.copyItems.forEach(
        (elem) => (elem.tags = elem.tags.map((e) => e.name))
      );
      this.copyItems = this.createDates(this.copyItems);
      this.filteredItems = this.copyItems.slice();
      this.searchedItems = this.copyItems.slice();
      this.calculatePages();
    },
    template: listTemplate,
  });
}
