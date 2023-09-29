
const sitemapTemplate = `
      <div xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
