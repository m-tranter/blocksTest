'use strict';

import { createSSRApp } from 'vue';
import entryTemplate from './entryTemplate.js';

export function createEntryApp(item) {
  return createSSRApp({
    data: () => ({
      item: item,
    }),
    methods: {
      prefix: function (str) {
        return 'https://www.cheshireeast.gov.uk' + str;
      },
      gmap: function (item) {
        return  `https://maps.google.com/maps?q=${item.mapLocation.lat},${item.mapLocation.lon}`;
      },
    },
    template: entryTemplate,
  });
}
