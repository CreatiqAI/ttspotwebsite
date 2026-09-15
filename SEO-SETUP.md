# TTSpot SEO setup and next steps

Primary website: https://ttspotwebsite.vercel.app/

## Reference reviewed

OpenSEO: https://github.com/every-app/open-seo, commit `7b9ee0e4fa800e5bae9ca76f49cb273a9c677204`.

Reviewed its README, `src/server/lib/audit/page-analyzer.ts`, `src/server/workflows/site-audit-workflow-helpers.ts`, and `src/server/lib/audit/issues/multipage-checks.ts`. Useful patterns are HTML metadata extraction, indexability, canonical normalization, headings, alt text, social metadata, structured data, sitemap membership and duplicate-page checks.

Used those categories as a reference only. No OpenSEO application code or dependencies were copied into the website, and no service was installed. Its keyword/rank/backlink data integration requires DataForSEO; no paid account or API is used here. The reference checkout is outside the website repository.

## Baseline findings and changes

| Check | Before | Current setup |
|---|---|---|
| Homepage title | Brand slogan only | Brand + Malaysia car meets and automotive community |
| Description | Generic early-access wording | Honest prelaunch and regional focus |
| Canonical URL | Missing | Primary Vercel homepage |
| robots.txt | HTTP 404 | Crawl allowed, sitemap linked |
| sitemap.xml | HTTP 404 | One canonical homepage; no hash fragments |
| Sharing metadata | Missing | Open Graph and Twitter cards using real logo |
| Structured data | Missing | Organization, WebSite, WebPage |
| Standalone CarPlay | Indexable utility screen | noindex, follow in HTML and Vercel header |
| Favicon | Generic symbol | TTSpot logo in 48px favicon and 180px touch icon |
| JavaScript disabled | Intro can obscure content | Intro hidden and feature text revealed |
| Future checks | None specific to SEO | `node check-seo.cjs` |

The one-page design and visual headings remain intact. No fake ratings, launch dates, local business offices, event schedules, keyword volumes or live signup claims were added. Structured data does not promise rich results or rankings.

## Free Google Search Console setup — account action required

1. Open https://search.google.com/search-console/ using the Google account that should own TTSpot.
2. Add a **URL-prefix** property: `https://ttspotwebsite.vercel.app/`. A Domain property is not suitable for a Vercel subdomain you do not control through DNS.
3. Select HTML tag verification. Provide Codex the exact Google-generated verification tag, or place it in `dist/index.html` inside `<head>`. Do not invent a token or use the Maps API key for verification.
4. Commit/push, wait for Vercel, then click Verify in Search Console. Keep the verification tag after verification.
5. Under Sitemaps, submit `sitemap.xml`.
6. Use URL Inspection on the homepage; test the live URL and request indexing once after verifying it is accessible.
7. Review indexing, actual queries, impressions and clicks after Google has crawled the site. Indexing and positions are not guaranteed or immediate.

Official guidance: https://support.google.com/webmasters/answer/9008080 and https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## Content priorities after the foundation

- Primary intent: TTSpot brand searches; Malaysia car meet community; KL/Selangor car meets; automotive community and vendor discovery. These are hypotheses, not measured keyword-volume findings.
- Add genuinely useful, linked regional guides once there is distinct content for each location. Do not create three near-identical city pages just to rank.
- Individual event pages need stable URLs, crawlable text, accurate dates and venues, and clear past-event status. Current map cards alone are not a substitute for dedicated indexable event pages.
- Vendor profiles should have owner-approved details, categories, correct location, hours and useful images. Do not claim TTSpot partnership unless confirmed.
- Preserve honest prelaunch wording until working product and signup flows exist. The current forms are previews.
- If adding Malay or Chinese pages, translate meaningful content and give each language a real URL before adding hreflang; Chinese snippets on this English page do not make separate language pages.
- Use Search Console queries to prioritize content. No paid keyword/rank APIs are necessary to start.

## Domain and duplicate-site maintenance

The previous `chatgpt.site` deployment still exists separately and was not republished by this Vercel change. If both should stay public, update that deployment with the same Vercel canonical; ideally redirect the old site to the chosen primary domain where hosting permits. Canonical tags are signals, not guarantees of Google's selection.

If a custom domain replaces Vercel later, update canonical, Open Graph URL/images, JSON-LD IDs/URLs, robots sitemap URL and sitemap entries together, then redirect the old domain and verify the new property in Search Console.

## Validation limits

Local SEO checks validate source and assets. HTTP checks validate the deployed responses. Browser rendering, Rich Results Test and actual indexing still need verification; the current Codex browser tool is unavailable. Never label the site indexed or report a ranking improvement based only on these checks.
