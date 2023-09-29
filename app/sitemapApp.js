'use strict';

import { createSSRApp } from 'vue';
import sitemapTemplate from './sitemapTemplate.js';

export function createSitemap(items) {
  return createSSRApp({
    data: () => ({
      items: items,
    }),
    template: sitemapTemplate,
  });
}
