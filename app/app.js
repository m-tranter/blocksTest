// app.js (shared between server and client)
import { createSSRApp } from 'vue';

export function createApp(items) {
  return createSSRApp({
    data: () => ({
      pages: [],
      items: [],
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
      totalCount: 0,
      pageSize: 10,
      pageCount: 0,
      pageBtns: [],
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
      prefix: function (str) {
        return 'https://www.cheshireeast.gov.uk' + str;
      },
      searchFilter: function () {
        console.log('In search filter');
        console.log(this.filteredItems);
        console.log(this.searchedItems);
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
        if (this.searchedItems.length > 0) {
          this.searchedItems.sort(this.sortDate());
        }
        this.calculatePages();
      },
      filterByCategories: function () {
        console.log('In filter');
        this.filteredItems = [];
        if (this.categoriesChecked.length === 0) {
          this.filteredItems = this.copyItems.slice();
        } else {
          this.filteredItems = this.copyItems.filter((elem) =>
            elem[this.filterField]
              .map((a) => a.name)
              .some((cat) => this.categoriesChecked.includes(cat))
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
      },
      createPages: function () {
        this.pages = [
          ...Array(Math.ceil(this.searchedItems.length / this.pageSize)),
        ].map((_) => this.searchedItems.splice(0, this.pageSize));
      },
      goToPage: function (pageNum) {
        document.getElementById('contentTypesContainer').scrollIntoView();
        this.items = this.pages[pageNum - 1];
        this.pageIndex = pageNum - 1;
        this.lastSearch = this.searchTerm;
      },
      applyFilters: function (cat) {
        console.log(cat);
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
        return value.toLocaleString('en-GB', this.dateOptions);
      },
      getTime: function (value) {
        let time = value.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
        if (time === '0:00 pm') {
          return '12 noon';
        } else if (time.startsWith('0')) {
          time = '12' + time.slice(1);
        }
        return time.replace(' ', '');
      },
      sortDate: function () {
        return (a, b) => {
          return a.dateStartEnd.from - b.dateStartEnd.from;
        };
      },
      createDates: function(arr) {
  return arr.map((e) => {
    return {
      ...e,
      dateStartEnd: {
        to: new Date(e.dateStartEnd.to),
        from: new Date(e.dateStartEnd.from),
      },
    };
  })
},
    },
    mounted() {
      this.copyItems = this.createDates(this.copyItems);
      this.filteredItems = this.copyItems.slice();
      this.searchedItems = this.copyItems.slice();
      this.calculatePages();
    },
    template: `<div id="contentTypesContainer" class="row events-container"><div class="col-lg-8"> <nav role="navigation" aria-label="Results data navigation"> <ul class="pagination d-flex flex-wrap mb-2 ms-0"> <li class="page-item" v-bind:class="{ disabled: pageIndex === 0 }"> <button class="page-link" type="button" v-on:click="goToPage(pageIndex)" > Previous </button> </li> <li v-for="pagebtn in pageBtns" class="page-item" v-bind:class="{ disabled: pageIndex === pagebtn - 1 }" v-bind:key="pagebtn" > <button class="page-link" type="button" v-on:click="goToPage(pagebtn)" > {{ pagebtn }} </button> </li> <li class="page-item" v-bind:class="{ disabled: pageIndex + 1 === pageCount }" > <button class="page-link" type="button" v-on:click="goToPage(pageIndex + 2)" > Next </button> </li> </ul> </nav> </div></div><div class="api-results-info"><p>Total results: <strong>{{ totalCount }}</strong></p><p>Current page: <strong>{{ pageIndex + 1 }}</strong></p></div><div v-for="item in items" v-bind:key="item.sys.id" tabindex="0" class="linkDiv ranger-event-card card card-item flex-md-row align-items-center" > <a href="#"><span class="innerLink" ><span class="visually-hidden">{{ item.title }}</span></span ></a > <div class="col-12 col-md-5 thumbnail-container d-flex justify-content-center px-2" > <img v-if="item.image != null" class="img-fluid rounded featured-img" v-bind:src="prefix(item.image.asset.sys.uri)" v-bind:alt="item.title" /> </div> <div class="card-body col-12 col-md-7 text-center text-md-start ps-md-4 ps-xl-2" > <h2 class="fs-4">{{ item.entryTitle }}</h2> <template v-if=" formatDate(item.dateStartEnd.from) === formatDate(item.dateStartEnd.to) " > <p>{{ formatDate(item.dateStartEnd.from) }}.</p> <p> <strong>Time:</strong> {{ getTime(item.dateStartEnd.from) }} - {{ getTime(item.dateStartEnd.to) }}. </p> </template> <template v-else> <p> From {{ getTime(item.dateStartEnd.from) }} on {{ formatDate(item.dateStartEnd.from) }}. </p> <p> Until {{ getTime(item.dateStartEnd.to) }} on {{ formatDate(item.dateStartEnd.to) }}. </p> </template> <p>{{ item.excerpt }}</p> </div></div>`,
  });
}
