import { BLOG_POSTS } from "@/lib/blog-data";

const BASE = "https://www.lallifafa.com";

export async function GET() {
  const items = BLOG_POSTS.map((post) => {
    const url = `${BASE}/blog/${post.slug}`;
    const pubDate = new Date(post.date).toUTCString();
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${post.tag}]]></category>
    </item>`;
  }).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Lalli Fafa Blog</title>
    <link>${BASE}/blog</link>
    <description>Tips, insights, and honest conversations about raising curious, creative, and kind children.</description>
    <language>en-IN</language>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${BASE}/lf-logo.png</url>
      <title>Lalli Fafa</title>
      <link>${BASE}</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
