'use strict';

import { createSSRApp } from 'vue';
import entryTemplate from './entryTemplate.js';

export function createEntryApp(item) {
  return createSSRApp({
    data: () => ({
      item: item,
    }),
    methods: {
      gmap: function (item) {
          return `https://maps.google.com/maps/dir//${item.mapLocation.lat},${item.mapLocation.lon}`;
      },
    },
    template: entryTemplate,
  });
}
