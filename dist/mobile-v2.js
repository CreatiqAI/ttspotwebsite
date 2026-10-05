/* Phone landing page behaviour (max-width:760px). Desktop is untouched: every handler checks the breakpoint. */
(()=>{
const phone=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const isPhone=()=>phone.matches;
const hero=document.querySelector('#regions');

/* Region chips switch the existing hero background, copy and cloud transition. */
const chips=[...document.querySelectorAll('[data-region-chip]')];
const order=['kl-selangor','johor','penang'];
function syncChips(){const key=hero?.dataset.region;chips.forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.regionChip===key)))}
chips.forEach(chip=>chip.addEventListener('click',()=>{
 const key=chip.dataset.regionChip,from=order.indexOf(hero.dataset.region);
 if(typeof show==='function')show(key,order.indexOf(key)<from?-1:1);
}));
if(hero){new MutationObserver(syncChips).observe(hero,{attributes:true,attributeFilter:['data-region']});syncChips()}

/* How-it-works step dots follow the horizontal scroll position. */
const steps=document.querySelector('.m-steps'),dots=[...document.querySelectorAll('.m-steps-dots span')];
if(steps&&dots.length){let stepFrame=0;steps.addEventListener('scroll',()=>{if(stepFrame)return;stepFrame=requestAnimationFrame(()=>{stepFrame=0;const first=steps.children[0],second=steps.children[1];const pitch=second&&first?second.offsetLeft-first.offsetLeft:steps.clientWidth;let index=Math.round(steps.scrollLeft/Math.max(1,pitch));if(steps.scrollLeft+steps.clientWidth>=steps.scrollWidth-4)index=dots.length-1;dots.forEach((dot,i)=>dot.classList.toggle('is-active',i===index))})},{passive:true})}

/* Live map sheet: Google Maps loads only when the visitor opens it. */
const sheet=document.querySelector('.m-map-sheet'),slot=sheet?.querySelector('.m-map-frame');let frame=null,sheetOpener=null;
function post(category){frame?.contentWindow?.postMessage({type:'ttspot-map',category},location.origin)}
function openMap(category,opener){
 if(!sheet)return;sheetOpener=opener||document.activeElement;
 if(!frame){frame=document.createElement('iframe');frame.title='TTSpot live map';frame.src='carplay.html?view=map';frame.addEventListener('load',()=>post(frame.dataset.category||'meets'));slot.append(frame)}
 frame.dataset.category=category;post(category);
 if(!sheet.open)sheet.showModal();sheet.querySelector('.m-map-close').focus();
}
sheet?.querySelector('.m-map-close').addEventListener('click',()=>sheet.close());
sheet?.addEventListener('close',()=>sheetOpener?.focus?.({preventScroll:true}));
document.querySelectorAll('[data-open-map]').forEach(el=>el.addEventListener('click',event=>{if(!isPhone())return;event.preventDefault();openMap(el.dataset.openMap,el)}));
document.querySelectorAll('.discovery .map-option[data-map]').forEach(el=>el.addEventListener('click',()=>{if(isPhone())openMap(el.dataset.map,el)}));

/* Slim progress road with the existing car sprite (replaces the side road and round progress button). */
const progress=document.createElement('div');progress.className='m-progress';progress.hidden=true;progress.setAttribute('aria-hidden','true');progress.innerHTML='<span class="m-progress-road"><span class="m-progress-fill"></span></span><span class="m-progress-car"></span>';document.body.append(progress);
const sticky=document.querySelector('.m-sticky-cta'),heroCta=document.querySelector('.hero .actions .primary'),closing=document.querySelector('.final-invite');
let frameId=0;
function paint(){
 frameId=0;if(!isPhone())return;
 const page=document.scrollingElement||document.documentElement,max=Math.max(1,page.scrollHeight-innerHeight),p=Math.max(0,Math.min(1,scrollY/max));
 progress.style.setProperty('--m-progress',p.toFixed(4));
 const intro=document.documentElement.classList.contains('intro-running');
 progress.classList.toggle('is-visible',!intro&&scrollY>40);
 if(!sticky)return;
 /* Appears once the hero's own waitlist button has scrolled away; hides at the closing call to action, the footer and any open dialog. */
 const pastHero=heroCta?heroCta.getBoundingClientRect().bottom<0:scrollY>innerHeight,atEnd=closing?closing.getBoundingClientRect().top<innerHeight-60:false;
 const show=!intro&&pastHero&&!atEnd&&!document.querySelector('dialog[open]');
 sticky.classList.toggle('is-visible',show);sticky.toggleAttribute('inert',!show);
}
function schedule(){if(!frameId)frameId=requestAnimationFrame(paint)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);phone.addEventListener('change',schedule);
const watch=new MutationObserver(schedule);watch.observe(document.documentElement,{attributes:true,attributeFilter:['class']});document.querySelectorAll('dialog').forEach(d=>watch.observe(d,{attributes:true,attributeFilter:['open']}));
schedule();
})();
