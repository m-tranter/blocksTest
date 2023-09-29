'use strict';

import fetch from 'node-fetch';

const ROOT_URL = `https://cms-chesheast.cloud.contensis.com/`;
const PROJECT = 'website';

async function getSitemap(req, res, contentType) {
  const resp = await fetch(
    `${ROOT_URL}/api/delivery/projects/${PROJECT}/contenttypes/${contentType}/entries?accessToken=QCpZfwnsgnQsyHHB3ID5isS43cZnthj6YoSPtemxFGtcH15I`,
    { method: 'get' }
  );

  // Abort if no data from the CMS.
  if (resp.status !== 200) {
    res.sendStatus(resp.status);
    return;
  }

  const data = await resp.json();
  let cf = "<changefreq>daily</changefreq>";
  let msg = `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://www.cheshireeast.gov.uk/${contentType.toLowerCase()}/listing</loc><lastmod>${data.items[0].sys.version.modified}</lastmod>${cf}</url>`;
  data.items.forEach((e) => {
    msg += `<url><loc>https://www.cheshireeast.gov.uk${e.sys.uri}</loc><lastmod>${e.sys.version.modified}</lastmod>${cf}</url>`;
  });
  msg += '</urlset>';
  res.set('Content-Type', 'application/xml');
  setTimeout(() => res.send(msg), 5);
  return;
}

export default getSitemap;
