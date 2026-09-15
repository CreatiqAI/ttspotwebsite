// Dependency-free checks inspired by OpenSEO's audit categories; no paid API calls.
const fs=require('fs'),assert=require('assert');const root=__dirname+'/dist/',site='https://ttspotwebsite.vercel.app/';const html=fs.readFileSync(root+'index.html','utf8');
function one(pattern,name){const m=[...html.matchAll(pattern)];assert.equal(m.length,1,name+' must occur once');return m[0]}
assert(one(/<title>([^<]+)<\/title>/g,'Title')[1].includes('Car Meets'));
assert(one(/<meta name="description" content="([^"]+)"/g,'Description')[1].includes('upcoming'));
assert.equal(one(/<link rel="canonical" href="([^"]+)"/g,'Canonical')[1],site);
assert.equal([...html.matchAll(/<h1\b/g)].length,1);assert(!/<meta name="robots"[^>]*noindex/.test(html));
for(const field of ['og:title','og:description','og:image','og:url'])one(new RegExp('<meta property="'+field+'" content="([^"]+)"','g'),field);
const graph=JSON.parse(one(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,'Structured data')[1]);assert(graph['@graph'].some(x=>x['@type']==='Organization'));assert(graph['@graph'].some(x=>x['@type']==='WebSite'));
for(const img of html.matchAll(/<img\b[^>]*>/g))assert(/\balt=/.test(img[0]),'Image alt missing');
const sitemap=fs.readFileSync(root+'sitemap.xml','utf8');assert(sitemap.includes('<loc>'+site+'</loc>'));assert(!sitemap.includes('#'));assert(!sitemap.includes('carplay.html'));assert(fs.readFileSync(root+'robots.txt','utf8').includes('Sitemap: '+site+'sitemap.xml'));assert(fs.readFileSync(root+'carplay.html','utf8').includes('content="noindex,follow"'));
for(const p of ['favicon-48.png','apple-touch-icon.png','carplay-assets/ttspot.jpg'])assert(fs.existsSync(root+p));
console.log('PASS: titles, description, canonical, headings, image alt, sharing tags, JSON-LD, robots, sitemap and iframe exclusion');
