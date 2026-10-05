/* Phone landing page behaviour (max-width:760px). Desktop is untouched: every handler checks the breakpoint. */
(()=>{
const phone=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const isPhone=()=>phone.matches;
const smooth=()=>reduced.matches?'auto':'smooth';
const hero=document.querySelector('#regions');

/* Region chips switch the existing hero background and cloud transition; the short line follows the region. */
const chips=[...document.querySelectorAll('[data-region-chip]')],heroLine=document.querySelector('.m-hero-line');
const order=['kl-selangor','johor','penang'];
function syncChips(){const key=hero?.dataset.region;chips.forEach(chip=>{const on=chip.dataset.regionChip===key;chip.setAttribute('aria-pressed',String(on));if(on&&heroLine&&chip.dataset.line)heroLine.textContent=chip.dataset.line})}
chips.forEach(chip=>chip.addEventListener('click',()=>{
 const key=chip.dataset.regionChip,from=order.indexOf(hero.dataset.region);
 if(typeof show==='function')show(key,order.indexOf(key)<from?-1:1);
}));
if(hero){new MutationObserver(syncChips).observe(hero,{attributes:true,attributeFilter:['data-region']});syncChips()}

/* How it works: the stage is pinned with CSS (position:sticky); native scroll position picks the step. No scroll hijacking. */
const how=document.querySelector('.m-how'),howSteps=[...document.querySelectorAll('.m-how-step')],howButtons=[...document.querySelectorAll('.m-how-progress button')],howBg=document.querySelector('.m-how-bg');
let howLive=false,howIndex=-1;
function setHowMode(){
 const live=!!how&&!reduced.matches;
 if(live===howLive)return;howLive=live;howIndex=-1;how?.classList.toggle('is-live',live);
 if(!live){howSteps.forEach(step=>step.classList.remove('is-active','is-past'));if(howBg)howBg.style.transform=''}
}
function paintHow(){
 if(!howLive)return;
 const rect=how.getBoundingClientRect(),span=Math.max(1,rect.height-innerHeight),p=Math.max(0,Math.min(1,-rect.top/span));
 const index=Math.min(howSteps.length-1,Math.floor(p*howSteps.length));
 howButtons.forEach((button,i)=>button.style.setProperty('--fill',Math.max(0,Math.min(1,p*howSteps.length-i)).toFixed(3)));
 if(index!==howIndex){howIndex=index;howSteps.forEach((step,i)=>{step.classList.toggle('is-active',i===index);step.classList.toggle('is-past',i<index)});howButtons.forEach((button,i)=>i===index?button.setAttribute('aria-current','step'):button.removeAttribute('aria-current'))}
 if(howBg&&rect.top<innerHeight&&rect.bottom>0){const travel=Math.max(0,howBg.offsetHeight-howBg.parentElement.clientHeight);howBg.style.transform='translate3d(0,'+(-p*travel).toFixed(1)+'px,0)'}
}
howButtons.forEach((button,i)=>button.addEventListener('click',()=>{
 if(!howLive){howSteps[i]?.scrollIntoView({block:'center',behavior:smooth()});return}
 const top=scrollY+how.getBoundingClientRect().top,span=how.offsetHeight-innerHeight;
 window.scrollTo({top:Math.round(top+span*(i+.5)/howSteps.length),behavior:smooth()});
}));

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

/* Light scroll reveal (fade + short slide, 300 ms), only when motion is allowed. */
if(isPhone()&&!reduced.matches&&'IntersectionObserver' in window){
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('m-in');io.unobserve(entry.target)}}),{rootMargin:'0px 0px -6% 0px',threshold:.01});
 document.querySelectorAll('.m-what h2,.m-tiles li,.m-sec-head,.m-map-card,.discovery .map-options,.partner-directory h3,.partner-brands article,.mobile-events h2,.m-events-track,.faq>div:first-child,.faq-list details,.mobile-ending>:not(.m-ending-bg)').forEach(el=>{
  const siblings=[...el.parentElement.children].filter(c=>c.tagName===el.tagName);el.style.setProperty('--m-delay',Math.min(3,siblings.indexOf(el))*60+'ms');
  el.classList.add('m-reveal');io.observe(el);
 });
}

/* Slim progress road with the existing car sprite; sticky waitlist bar with back-to-top; a standalone back-to-top when the bar is away. */
const progress=document.createElement('div');progress.className='m-progress';progress.hidden=true;progress.setAttribute('aria-hidden','true');progress.innerHTML='<span class="m-progress-road"><span class="m-progress-fill"></span></span><span class="m-progress-car"></span>';document.body.append(progress);
const sticky=document.querySelector('.m-sticky-cta'),floatTop=document.querySelector('.m-top-float'),heroCta=document.querySelector('.hero .actions .primary'),closing=document.querySelector('.final-invite'),footerTop=document.querySelector('.tt-footer-bottom a[href="#regions"]');
document.querySelectorAll('.m-top').forEach(button=>button.addEventListener('click',()=>{window.scrollTo({top:0,behavior:smooth()});if(location.hash)history.replaceState(null,'',location.pathname+location.search+'#regions')}));
/* A red ring around each back-to-top button fills as the page scrolls. */
document.querySelectorAll('.m-top').forEach(button=>button.insertAdjacentHTML('afterbegin','<svg class="m-top-ring" viewBox="0 0 52 52" aria-hidden="true" focusable="false"><circle class="m-top-track" cx="26" cy="26" r="24.5"/><circle class="m-top-arc" cx="26" cy="26" r="24.5" pathLength="100"/></svg>'));
const topArcs=[...document.querySelectorAll('.m-top-arc')];
const avoid=[...document.querySelectorAll('.hero .actions .primary,.hero .m-hero-partner,.mobile-ending .primary,.mobile-ending .m-ending-partner,.mobile-ending .m-footnote,.tt-footer a')];
let frameId=0;
function setVisible(el,on){if(!el)return;el.classList.toggle('is-visible',on);el.toggleAttribute('inert',!on)}
function paint(){
 frameId=0;setHowMode();paintHow();if(!isPhone())return;
 const page=document.scrollingElement||document.documentElement,max=Math.max(1,page.scrollHeight-innerHeight),p=Math.max(0,Math.min(1,scrollY/max));
 progress.style.setProperty('--m-progress',p.toFixed(4));
 for(const arc of topArcs)arc.style.strokeDashoffset=(100-p*100).toFixed(2);
 const intro=document.documentElement.classList.contains('intro-running'),dialog=!!document.querySelector('dialog[open]');
 progress.classList.toggle('is-visible',!intro&&scrollY>40);
 const pastHero=heroCta?heroCta.getBoundingClientRect().bottom<0:scrollY>innerHeight,atEnd=closing?closing.getBoundingClientRect().top<innerHeight-60:false;
 const barOn=!intro&&!dialog&&pastHero&&!atEnd;setVisible(sticky,barOn);
 const footerLink=footerTop?footerTop.getBoundingClientRect():null,footerLinkSeen=footerLink?footerLink.top<innerHeight&&footerLink.bottom>0:false;
 let floatOn=!intro&&!dialog&&!barOn&&scrollY>innerHeight*.6&&!footerLinkSeen;
 /* Never park the floating button over a button or link. */
 if(floatOn&&floatTop){const zone={left:innerWidth-76,top:innerHeight-84};floatOn=!avoid.some(el=>{const r=el.getBoundingClientRect();return r.width&&r.right>zone.left&&r.bottom>zone.top&&r.top<innerHeight})}
 setVisible(floatTop,floatOn);
}
function schedule(){if(!frameId)frameId=requestAnimationFrame(paint)}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);phone.addEventListener('change',schedule);reduced.addEventListener('change',schedule);
const watch=new MutationObserver(schedule);watch.observe(document.documentElement,{attributes:true,attributeFilter:['class']});document.querySelectorAll('dialog').forEach(d=>watch.observe(d,{attributes:true,attributeFilter:['open']}));
schedule();
})();
