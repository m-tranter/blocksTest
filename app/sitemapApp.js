'use strict';

import { createSSRApp } from 'vue';
import sitemapTemplate from './sitemapTemplate.js';

export function createSitemap(items, ctype) {
  return createSSRApp({
    data: () => ({
      items: items,
      ctype: ctype
    }),
    template: sitemapTemplate,
  });
}
