// app.js (shared between server and client)
import { createSSRApp } from 'vue';

export function createApp(items) {
  return createSSRApp({
    data: () => ({ items: items }),
    template: `<div><h2>List of events</h2><p v-for="item in items">{{ item.entryTitle }}</p></div>`,
  });
}
