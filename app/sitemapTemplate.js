const sitemapTemplate = `
      <div xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <p>
          <a
          >https://www.cheshireeast.gov.uk/{{ctype.toLowerCase()}}/listing</a
          >
          <b>{{items[0].sys.version.modified}}</b>
          <i>daily</i>
        </p>
        <p v-for="item in items">
          <a
          >https://www.cheshireeast.gov.uk{{item.sys.uri}}</a
          >
          <b>{{item.sys.version.modified}}</b>
          <i>daily</i>
        </p>
      </div>
  `;

export default sitemapTemplate;
