/* TiTi card viewer (phones and desktop): the tapped fan card expands into a large view (FLIP),
   swipe / arrows / keyboard move through the set, tap flips to the back, close returns it to the fan.
   Card data mirrors the app's card_types table. */
(()=>{
const CARDS=[
 {name:'Welcoming Friends',rarity:'Common',line:'Find your circle.',color:'#E00008'},
 {name:'Offering Blessings',rarity:'Common',line:'Good people. Great journeys.',color:'#F25C5C'},
 {name:'Striking Poses',rarity:'Common',line:'Same TiTi. Different vibes.',color:'#7C5CE6'},
 {name:'Taking Photos',rarity:'Common',line:'Find the spot. Capture the moment.',color:'#2B9BFF'},
 {name:'Waiting for the Meet',rarity:'Rare',line:'Good cars. Greater company.',color:'#B98B5E'},
 {name:'Helping on the Road',rarity:'Rare',line:'Safer drives. Brighter journeys.',color:'#3CB393'},
 {name:'Built for a Better Drive',rarity:'Secret',line:'Secret version 07. TT Spot × TypeOne. Stable drives, stronger journeys.',color:'#F5B301'}
];
const fan=document.querySelector('.m-fan'),dialog=document.querySelector('.tc-viewer');
if(!fan||!dialog)return;
const buttons=[...fan.querySelectorAll('.m-fan-card')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const card=dialog.querySelector('.tc-card'),inner=dialog.querySelector('.tc-inner'),front=dialog.querySelector('.tc-front'),back=dialog.querySelector('.tc-back');
const nameEl=dialog.querySelector('#tc-name'),lineEl=dialog.querySelector('#tc-line'),rarityEl=dialog.querySelector('.tc-rarity'),countEl=dialog.querySelector('.tc-count span'),dots=dialog.querySelector('.tc-dots');
const pad=n=>String(n).padStart(2,'0'),hd=i=>'titi-cards/card-'+(i+1)+'-v1.webp',thumb=i=>buttons[i]?.querySelector('img')?.currentSrc||buttons[i]?.querySelector('img')?.src||'';
let index=0,busy=false,flipped=false;
CARDS.forEach((c,i)=>{const dot=document.createElement('button');dot.type='button';dot.className='tc-dot';dot.setAttribute('aria-label','Card '+pad(i+1)+', '+c.name);dot.addEventListener('click',()=>go(i));dots.append(dot)});
const dotButtons=[...dots.children];
function preload(i){const img=new Image();img.src=hd((i+CARDS.length)%CARDS.length)}
function fill(i){
 index=i;const c=CARDS[i];
 dialog.style.setProperty('--card-color',c.color);
 front.style.backgroundImage='url("'+thumb(i)+'")';
 const img=front.querySelector('img');img.classList.remove('is-loaded');img.onload=()=>img.classList.add('is-loaded');img.src=hd(i);img.alt='TiTi card '+pad(i+1)+', '+c.name;
 nameEl.textContent=c.name;lineEl.textContent=c.line;rarityEl.textContent=c.rarity;rarityEl.dataset.rarity=c.rarity.toLowerCase();countEl.textContent=pad(i+1);
 dotButtons.forEach((d,j)=>d.setAttribute('aria-current',String(j===i)));
 setFlip(false,true);preload(i+1);preload(i-1);
}
function setFlip(on,instant){flipped=on;card.setAttribute('aria-pressed',String(on));card.setAttribute('aria-label',on?'Show the front of the card':'Flip to the back of the card');inner.classList.toggle('is-instant',!!instant);dialog.classList.toggle('is-flipped',on);if(instant)requestAnimationFrame(()=>inner.classList.remove('is-instant'))}
function rotationOf(button){return parseFloat(getComputedStyle(button).getPropertyValue('--r'))||0}
/* FLIP: start the big card exactly over the fan card, then let it settle at its own place. */
function flyFrom(button,reverse){
 const from=button.getBoundingClientRect(),to=card.getBoundingClientRect();
 const dx=from.left+from.width/2-(to.left+to.width/2),dy=from.top+from.height/2-(to.top+to.height/2),s=button.offsetWidth/Math.max(1,card.offsetWidth);
 const there='translate('+dx+'px,'+dy+'px) rotate('+rotationOf(button)+'deg) scale('+s+')';
 return new Promise(done=>{
  card.style.transition='none';card.style.transform=reverse?'none':there;card.getBoundingClientRect();
  card.style.transition='transform 360ms cubic-bezier(.2,.9,.25,1.12)';card.style.transform=reverse?there:'none';
  let finished=false;const end=()=>{if(finished)return;finished=true;card.style.transition='';if(!reverse)card.style.transform='';done()};
  card.addEventListener('transitionend',end,{once:true});setTimeout(end,520);
 });
}
let opener=null;
async function open(i){
 if(busy||dialog.open)return;busy=true;opener=buttons[i];fill(i);
 document.documentElement.classList.add('tc-open');dialog.showModal();dialog.classList.add('is-in');
 if(!reduced.matches){buttons[i].classList.add('is-lifted');await flyFrom(buttons[i],false)}
 card.focus({preventScroll:true});busy=false;
}
async function close(){
 if(busy||!dialog.open)return;busy=true;const target=buttons[index];
 dialog.classList.remove('is-in');
 if(!reduced.matches){setFlip(false,true);buttons.forEach(b=>b.classList.remove('is-lifted'));target.classList.add('is-lifted');await flyFrom(target,true)}
 dialog.close();document.documentElement.classList.remove('tc-open');buttons.forEach(b=>b.classList.remove('is-lifted'));card.style.transform='';
 target.focus({preventScroll:true});busy=false;
}
function go(i,dir){
 const next=(i+CARDS.length)%CARDS.length;if(next===index||busy)return;
 dir=dir||(next>index?1:-1);
 if(reduced.matches){fill(next);return}
 busy=true;card.style.transition='transform 160ms ease-in,opacity 160ms ease-in';card.style.transform='translateX('+(-dir*60)+'px) rotate('+(-dir*4)+'deg)';card.style.opacity='0';
 setTimeout(()=>{buttons.forEach(b=>b.classList.remove('is-lifted'));buttons[next].classList.add('is-lifted');fill(next);card.style.transition='none';card.style.transform='translateX('+(dir*60)+'px) rotate('+(dir*4)+'deg)';card.getBoundingClientRect();
  card.style.transition='transform 240ms cubic-bezier(.2,.9,.25,1.1),opacity 200ms ease-out';card.style.transform='';card.style.opacity='';setTimeout(()=>{card.style.transition='';busy=false},250)},160);
}
buttons.forEach((b,i)=>b.addEventListener('click',()=>open(i)));
dialog.querySelector('.tc-close').addEventListener('click',close);
dialog.querySelector('.tc-prev').addEventListener('click',()=>go(index-1,-1));
dialog.querySelector('.tc-next').addEventListener('click',()=>go(index+1,1));
dialog.querySelector('.tc-flip').addEventListener('click',()=>setFlip(!flipped));
dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();go(index+1,1)}else if(e.key==='ArrowLeft'){e.preventDefault();go(index-1,-1)}});
/* Tap the backdrop (anything outside the card, controls and details) to close. */
dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.classList.contains('tc-stage')||e.target.classList.contains('tc-shell'))close()});
/* Swipe: sideways moves through the set, down closes. A short tap on the card flips it. */
let start=null;
card.addEventListener('pointerdown',e=>{start={x:e.clientX,y:e.clientY,t:performance.now(),id:e.pointerId};try{card.setPointerCapture(e.pointerId)}catch{}});
card.addEventListener('pointermove',e=>{if(!start||busy||reduced.matches)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>8||dy>8){card.style.transition='none';card.style.transform=Math.abs(dx)>Math.abs(dy)?'translateX('+dx*.6+'px) rotate('+dx*.03+'deg)':'translateY('+Math.max(0,dy)*.6+'px) scale('+(1-Math.max(0,dy)/1600)+')'}});
function endSwipe(e){
 if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y,moved=Math.abs(dx)>10||Math.abs(dy)>10;start=null;
 if(!moved)return;card.dataset.swiped='1';setTimeout(()=>delete card.dataset.swiped,0);
 card.style.transition='transform 200ms ease-out';card.style.transform='';setTimeout(()=>{if(!busy)card.style.transition=''},210);
 if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))go(index+(dx<0?1:-1),dx<0?1:-1);else if(dy>80&&dy>Math.abs(dx))close();
}
card.addEventListener('pointerup',endSwipe);card.addEventListener('pointercancel',()=>{start=null;card.style.transform=''});
card.addEventListener('click',e=>{if(card.dataset.swiped)return;setFlip(!flipped)});
/* Deal the cards out of a stack once, when the fan first scrolls into view. */
if(!reduced.matches&&'IntersectionObserver' in window){
 fan.classList.add('is-stacked');
 const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){fan.classList.remove('is-stacked');fan.classList.add('is-dealt');io.disconnect()}},{threshold:.35});
 io.observe(fan);
}
})();
