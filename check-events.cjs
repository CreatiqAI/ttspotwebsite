const fs=require('fs'),vm=require('vm'),assert=require('assert');
class E{getBoundingClientRect(){return {width:600,height:350}}constructor(){this.dataset={};this.children=[];this.attrs={}}append(...x){this.children.push(...x)}replaceChildren(...x){this.children=x}addEventListener(n,f){this[n]=f}setAttribute(k,v){this.attrs[k]=v}querySelector(s){return this.nodes[s]}set innerHTML(v){this.nodes={};for(const s of ['.tt-map-canvas','.tt-map-badge','.tt-map-expand','.tt-map-status'])this.nodes[s]=new E()}}
const elements=Object.fromEntries(['#dashboard-map-slot','#full-map-slot','#map-region','#map-search','#map-clear'].map(s=>[s,new E()])),head=new E(),filters=['all','meets','checkpoints','vendors'].map(x=>{const e=new E();e.dataset.filter=x;return e}),events={},parent={},markers=[];let map,observe,count=0;
const document={head,createElement:()=>new E(),addEventListener(){},querySelector:s=>elements[s],querySelectorAll:s=>s==='[data-filter]'?filters:[]};
class Map{constructor(el,o){count++;map=this;this.center=o.center}setZoom(z){this.zoom=z}setCenter(c){this.center=c}getCenter(){return this.center}panTo(c){this.center=c}fitBounds(b){this.bounds=b}}
class Marker{constructor(o){Object.assign(this,o);markers.push(this)}addListener(n,f){this.click=f}}
const window={TTSPOT_GOOGLE_MAPS_KEY:'test',addEventListener:(n,f)=>events[n]=f},google={maps:{Map,InfoWindow:class{},LatLngBounds:class{constructor(){this.points=[]}extend(p){this.points.push(p)}},ColorScheme:{DARK:'DARK'},marker:{AdvancedMarkerElement:Marker},event:{trigger(){},addListenerOnce(m,n,f){m.loaded=f}}}};
const ctx={document,window,google,parent,location:{origin:'https://ttspot.test',reload(){}},URLSearchParams,openPage(){},matchMedia:()=>({matches:false}),requestAnimationFrame:f=>f(),setTimeout:()=>1,clearTimeout(){},ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(f){observe=f}observe(){}disconnect(){}}};

vm.runInNewContext(fs.readFileSync(__dirname+'/dist/ttspot-listings.js','utf8'),ctx);
vm.runInNewContext(fs.readFileSync(__dirname+'/dist/ttspot-map.js','utf8'),ctx);
observe([{isIntersecting:true}]);window.ttspotGoogleReady();
const active=()=>markers.filter(m=>m.map),world=elements['#dashboard-map-slot'].children[0],detail=world.children.find(e=>e.className==='tt-event-detail');
assert.equal(active().length,10);assert.equal(map.bounds.points.length,10);
const select=(category)=>filters.find(f=>f.dataset.filter===category).onclick();
for(const [category,total] of [['checkpoints',2],['vendors',1],['meets',10]]){
 select(category);assert.equal(active().length,total);
 const allowed=window.TTSPOT_LISTINGS.filter(p=>p.category===category);
 assert(active().every(m=>allowed.some(p=>m.title.startsWith(p.title+' — '))));
 elements['#map-clear'].onclick();assert.equal(active().length,total);
}
select('checkpoints');elements['#map-search'].input({target:{value:'Penang Autoshow'}});
assert.equal(active().length,1);active()[0].click();assert.equal(map.center.lat,5.37029);
assert.equal(detail.children[2].children[0].textContent,'Past event');
select('vendors');assert.equal(active().length,1);active()[0].click();
assert(active()[0].title.includes('Soundstream'));
assert(detail.children[2].children.find(e=>e.className==='tt-detail-actions').children[0].href.includes('maps/dir/?api=1'));
select('meets');
for(const p of window.TTSPOT_LISTINGS.filter(p=>p.suggested)){
 elements['#map-clear'].onclick();elements['#map-search'].input({target:{value:p.title}});
 assert.equal(active().length,1);active()[0].click();assert.equal(map.center.lat,p.lat);
 assert.equal(detail.children[2].children[0].textContent,'Suggested meet spot');
 assert(fs.existsSync(__dirname+'/dist/'+p.thumbnail));
}
elements['#map-clear'].onclick();
for(const [region,total] of [['kl',4],['johor',3],['penang',3]]){elements['#map-region'].onchange({target:{value:region}});assert.equal(active().length,total)}
select('vendors');assert.equal(active().length,0);
elements['#map-clear'].onclick();assert.equal(active().length,1);
events.message({origin:'https://ttspot.test',source:parent,data:{type:'ttspot-map',category:'checkpoints'}});assert.equal(active().length,2);
events.message({origin:'https://ttspot.test',source:parent,data:{type:'ttspot-map',category:'all'}});assert.equal(active().length,2);
ctx.openPage('dashboard');assert.equal(count,1);
const html=fs.readFileSync(__dirname+'/dist/carplay.html','utf8');
assert.equal((html.match(/data-map-shortcut=/g)||[]).length,3);assert(!html.includes('data-filter="all"'));
console.log('PASS: exclusive TT / autoshow / vendor categories, reset preserves category, region filters, search, details, parent shortcuts, three tablet buttons and single map reuse');
