/* TiTi cards: a pinned section where native scroll position drives the sequence (no scroll hijacking).
   Grouped deck -> spread -> cards 01-07 lift to the front one by one with their details -> settled spread.
   Only transforms and opacity change, once per animation frame. Reduced motion keeps the static fan. */
(()=>{
const section=document.querySelector('.m-cards'),stage=section?.querySelector('.cards-stage'),fan=section?.querySelector('.m-fan');
if(!section||!stage||!fan)return;
const CARDS=window.TTSPOT_CARDS||[];
const cards=[...fan.querySelectorAll('.m-fan-card')],glows=[...section.querySelectorAll('.cards-glow span')],steps=[...section.querySelectorAll('[data-card-step]')];
const detail=section.querySelector('.cards-detail'),countEl=detail.querySelector('.cd-count span'),nameEl=detail.querySelector('.cd-name'),rarityEl=detail.querySelector('.cd-rarity'),lineEl=detail.querySelector('.cd-line');
/* Before card 01 comes forward, the detail panel shows the set at a glance instead of standing empty. */
const intro=document.createElement('div');intro.className='cd-intro';intro.innerHTML='<p class="cd-intro-title">The set</p><ul class="cd-intro-rarity"><li><span class="tc-rarity" data-rarity="common">Common</span><b>×4</b></li><li><span class="tc-rarity" data-rarity="rare">Rare</span><b>×2</b></li><li><span class="tc-rarity" data-rarity="secret">Secret</span><b>×1</b></li></ul><p class="cd-intro-cue"><span aria-hidden="true">↓</span> Scroll to deal the cards</p>';detail.prepend(intro);const cueEl=intro.querySelector('.cd-intro-cue');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width:760px)'),tablet=matchMedia('(min-width:761px) and (max-width:1050px)');
const FAN=[-30,-20,-10,10,20,30,0],FANZ=[1,2,3,3,2,1,5];
/* Progress phases: closed deck until DECK, opening into the fan until SPREAD, then the fan stays open while the page carries on.
   (The owner preferred no one-by-one focus: FOCUS_END = SPREAD, so there are no focus slots.)
   Pins are short (phones especially) and the deck starts opening while the section is still sliding up (LEAD), so it costs little scrolling. */
let DECK=.12,SPREAD=.62,FOCUS_END=.62,SLOT=0,LEAD=0;
function phases(){if(phone.matches){DECK=.06;SPREAD=.82;LEAD=.32}else{DECK=.08;SPREAD=.74;LEAD=.25}FOCUS_END=SPREAD;SLOT=(FOCUS_END-SPREAD)/7}
phases();
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const back=t=>{t=clamp(t);const c1=1.25,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)};
let live=false,ch=0,cw=0,boxW=0,frame=0,active=-2,swap=false,poses=cards.map(()=>({r:0,s:1}));
window.TTSpotCardPose=i=>live&&poses[i]?poses[i]:null;
function measure(){ch=cards[0]?.offsetHeight||0;cw=cards[0]?.offsetWidth||0;boxW=fan.clientWidth||0}
function setMode(){
 const on=!reduced.matches;if(on===live)return;live=on;section.classList.toggle('is-seq',on);
 if(!on){cards.forEach(c=>{c.style.transform='';c.style.opacity='';c.style.zIndex=''});glows.forEach(g=>g.style.opacity='');active=-2;stage.classList.remove('is-secret');return}
 measure();schedule();
}
function weight(i,p){
 if(SLOT<=0)return 0;
 const u=(p-(SPREAD+SLOT*i))/SLOT;if(u<=0||u>=1)return 0;
 if(u<.3)return back(u/.3);if(u<.76)return 1;return 1-smooth((u-.76)/.24);
}
function showDetail(i){
 if(i===active)return;
 /* Between the two overview states (deck closed / fan open) only the cue line changes: no panel animation,
    so the Common/Rare/Secret badges stay still instead of blinking. */
 const calm=(i===-1||i===7)&&(active===-1||active===7||active===-2);
 const changedCue=(i===-1||i===7)&&(active===-1||active===7);
 active=i;
 if(!calm){swap=!swap;detail.classList.toggle('swap-a',swap);detail.classList.toggle('swap-b',!swap)}
 stage.classList.toggle('is-secret',i===6);
 if(i>=0&&i<7){const c=CARDS[i]||{};detail.dataset.state='card';countEl.textContent=String(i+1).padStart(2,'0');nameEl.textContent=c.name||'';rarityEl.textContent=c.rarity||'';rarityEl.dataset.rarity=(c.rarity||'').toLowerCase();lineEl.textContent=c.line||'';stage.style.setProperty('--focus-color',c.color||'#ef0010')}
 else if(i===7){detail.dataset.state='done';cueEl.innerHTML='Tap a card to see it up close'}
 else{detail.dataset.state='intro';cueEl.innerHTML='<span aria-hidden="true">↓</span> Scroll to deal the cards'}
 if(changedCue&&!reduced.matches&&cueEl.animate)cueEl.animate([{opacity:0},{opacity:1}],{duration:260,easing:'ease-out'});
 steps.forEach((b,j)=>j===i?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current'));
}
const fills=steps.map(()=>-1);
function paint(){
 frame=0;if(!live)return;
 const rect=section.getBoundingClientRect();if(rect.bottom<-50||rect.top>innerHeight+50)return;
 if(!ch)measure();
 const lead=innerHeight*LEAD,span=Math.max(1,rect.height-innerHeight)+lead,p=clamp((lead-rect.top)/span);
 const e=smooth((p-DECK)/(SPREAD-DECK));
 const L=ch*1.18,k=boxW&&cw?clamp((boxW-cw-8)/(2*L*Math.sin(Math.PI/6)),.55,1):1,fanY=ch*(phone.matches?.02:.04),focusS=phone.matches?1.32:tablet.matches?1.42:1.5,focusY=-ch*(phone.matches?.1:.08);
 let maxW=0,top=-1;const w=cards.map((_,i)=>weight(i,p));
 w.forEach((v,i)=>{if(v>maxW){maxW=v;top=i}});
 cards.forEach((card,i)=>{
  const fa=FAN[i]*k,fr=fa*Math.PI/180,fx=L*Math.sin(fr),fy=L*(1-Math.cos(fr))+fanY,fs=i===6?1.12:1;
  const dx=(i-3)*1.6,dy=-(6-i)*1.4-ch*.02,dr=(i-3)*1.4,ds=.96;
  let x=lerp(dx,fx,e),y=lerp(dy,fy,e),r=lerp(dr,fa,e),s=lerp(ds,fs,e);
  const f=w[i];let tilt=0;
  if(f>0){x=lerp(x,0,f);y=lerp(y,focusY,f);r=lerp(r,0,clamp(f));s=lerp(s,focusS,f);tilt=-10*Math.sin(Math.PI*clamp(f))*(i%2?1:-1)}
  const dim=top>=0&&top!==i?1-.42*clamp(maxW):1;
  card.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+r.toFixed(2)+'deg) rotateY('+tilt.toFixed(2)+'deg) scale('+s.toFixed(3)+')';
  card.style.opacity=dim.toFixed(3);
  card.style.zIndex=f>.02?20+Math.round(f*10):e>.5?FANZ[i]:7-i;
  poses[i]={r,s};
  if(glows[i])glows[i].style.opacity=(clamp(f)*(i===6?1:.85)).toFixed(3);
 });
 /* Deck-only mode: open once the fan has spread, and only fall back a little earlier, so hovering on the threshold can't flicker. */
 if(SLOT<=0)showDetail(active===7?(p>=SPREAD-.04?7:-1):(p>=SPREAD?7:-1));
 else showDetail(p<SPREAD+SLOT*.15?-1:p>=FOCUS_END-SLOT*.12?7:(top>=0&&w[top]>.25?top:active>=0&&active<7?active:-1));
 steps.forEach((b,i)=>{const v=Math.round(clamp((p-(SPREAD+SLOT*i))/SLOT)*100)/100;if(v!==fills[i]){fills[i]=v;b.style.setProperty('--fill',v)}});
}
function schedule(){if(!frame)frame=requestAnimationFrame(paint)}
steps.forEach((b,i)=>b.addEventListener('click',()=>{
 if(!live){cards[i]?.focus();return}
 const lead=innerHeight*LEAD,top=scrollY+section.getBoundingClientRect().top-lead,span=section.offsetHeight-innerHeight+lead;
 window.scrollTo({top:Math.round(top+span*(SPREAD+SLOT*(i+.5))),behavior:reduced.matches?'auto':'smooth'});
}));
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',()=>{measure();schedule()});
reduced.addEventListener('change',setMode);phone.addEventListener('change',()=>{phases();measure();schedule()});
new ResizeObserver(()=>{measure();schedule()}).observe(cards[0]);
setMode();schedule();
})();
