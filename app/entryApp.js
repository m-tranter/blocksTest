import { createSSRApp } from 'vue';
import entryTemplate from './entryTemplate.js';

export function createEntryApp(item) {
  return createSSRApp({
    data: () => ({
      item: item,
      dateOptions: {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
    }),
    methods: {
      prefix: function (str) {
        return 'https://www.cheshireeast.gov.uk' + str;
      },
      gmap: function (item) {
        return (
          'https://maps.google.com/maps?q=' +
          item.mapLocation.lat +
          ',' +
          item.mapLocation.lon
        );
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
    },
    template: entryTemplate,
  });
}
