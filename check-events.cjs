const fs=require('fs'),vm=require('vm'),assert=require('assert');
class E{getBoundingClientRect(){return {width:600,height:350}}constructor(){this.dataset={};this.children=[];this.attrs={}}append(...x){this.children.push(...x)}replaceChildren(...x){this.children=x}addEventListener(n,f){this[n]=f}setAttribute(k,v){this.attrs[k]=v}querySelector(s){return this.nodes[s]}set innerHTML(v){this.nodes={};for(const s of ['.tt-map-canvas','.tt-map-badge','.tt-map-expand','.tt-map-status'])this.nodes[s]=new E()}}
const elements=Object.fromEntries(['#dashboard-map-slot','#full-map-slot','#map-region','#map-search','#map-clear'].map(s=>[s,new E()])),head=new E(),filters=['all','meets','checkpoints','vendors'].map(x=>{const e=new E();e.dataset.filter=x;return e}),events={},parent={},markers=[];let map,observe,count=0;
const document={head,createElement:()=>new E(),addEventListener(){},querySelector:s=>elements[s],querySelectorAll:s=>s==='[data-filter]'?filters:[]};
class Map{constructor(el,o){count++;map=this;this.center=o.center}setZoom(z){this.zoom=z}setCenter(c){this.center=c}getCenter(){return this.center}panTo(c){this.center=c}fitBounds(b){this.bounds=b}}
class Marker{constructor(o){Object.assign(this,o);markers.push(this)}addListener(n,f){this.click=f}}
const window={TTSPOT_GOOGLE_MAPS_KEY:'test',addEventListener:(n,f)=>events[n]=f},google={maps:{Map,InfoWindow:class{},LatLngBounds:class{constructor(){this.points=[]}extend(p){this.points.push(p)}},ColorScheme:{DARK:'DARK'},marker:{AdvancedMarkerElement:Marker},event:{trigger(){},addListenerOnce(m,n,f){m.loaded=f}}}};
const ctx={document,window,google,parent,location:{origin:'https://ttspot.test',reload(){}},URLSearchParams,openPage(){},matchMedia:()=>({matches:false}),requestAnimationFrame:f=>f(),setTimeout:()=>1,clearTimeout(){},ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(f){observe=f}observe(){}disconnect(){}}};
vm.runInNewContext(fs.readFileSync(__dirname+'/dist/ttspot-listings.js','utf8'),ctx);vm.runInNewContext(fs.readFileSync(__dirname+'/dist/ttspot-map.js','utf8'),ctx);observe([{isIntersecting:true}]);window.ttspotGoogleReady();const active=()=>markers.filter(m=>m.map);assert.equal(active().length,13);assert.equal(map.bounds.points.length,13);filters[1].onclick();assert.equal(active().length,12);elements['#map-search'].input({target:{value:'Penang Autoshow'}});assert.equal(active().length,1);active()[0].click();assert.equal(map.center.lat,5.37029);const world=elements['#dashboard-map-slot'].children[0],detail=world.children.find(e=>e.className==='tt-event-detail');assert.equal(detail.hidden,false);assert.equal(detail.children[2].children[0].textContent,'Past event');elements['#map-clear'].onclick();assert.equal(active().length,13);elements['#map-region'].onchange({target:{value:'johor'}});assert.equal(active().length,3);elements['#map-clear'].onclick();filters[3].onclick();assert.equal(active().length,1);assert(active()[0].title.includes('Soundstream'));active()[0].click();const actions=detail.children[2].children.find(e=>e.className==='tt-detail-actions');assert(actions.children[0].href.includes('maps/dir/?api=1'));ctx.openPage('dashboard');assert.equal(count,1);const suggested=window.TTSPOT_LISTINGS.filter(p=>p.suggested);
assert.equal(suggested.length,10);
assert.equal(new Set(window.TTSPOT_LISTINGS.map(p=>p.id)).size,13);
for(const [region,total] of [['kl',4],['johor',3],['penang',3]])assert.equal(suggested.filter(p=>p.region===region).length,total);
for(const p of suggested){
  assert.equal(p.category,'meets');assert(!p.end);assert.equal(p.time,'No scheduled meet');
  assert(fs.existsSync(__dirname+'/dist/'+p.thumbnail));assert(fs.existsSync(__dirname+'/dist/'+p.image));
  assert(p.lat>1&&p.lat<6&&p.lng>100&&p.lng<105);
  elements['#map-clear'].onclick();elements['#map-search'].input({target:{value:p.title}});
  assert.equal(active().length,1);assert(active()[0].content.className.includes('is-meet-flag'));
  active()[0].click();assert.equal(map.center.lat,p.lat);assert.equal(map.center.lng,p.lng);
  assert.equal(detail.children[2].children[0].textContent,'Suggested meet spot');
}
elements['#map-clear'].onclick();
for(const [region,total] of [['kl',6],['johor',3],['penang',4]]){elements['#map-region'].onchange({target:{value:region}});assert.equal(active().length,total)}
elements['#map-clear'].onclick();filters[2].onclick();assert.equal(active().length,0);
console.log('PASS: 10 suggested flag pins + 3 existing listings; all pin details, regional counts, search, categories, empty state, past-event labels, directions and single map reuse');
