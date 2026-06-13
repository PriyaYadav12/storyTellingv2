// Submits every URL in the live sitemap to IndexNow (Bing, Yandex, etc.)
// Run after publishing new content: npm run seo:indexnow

const HOST = "www.lallifafa.com";
const KEY = "280c3cef070267b22669581b20b78fc6";

const sitemapRes = await fetch(`https://${HOST}/sitemap.xml`);
const xml = await sitemapRes.text();
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  }),
});

console.log(`Submitted ${urls.length} URLs — status ${res.status}`);
console.log(await res.text());
