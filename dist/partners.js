(()=>{
const root=document.querySelector('.partner-carousel');if(!root)return;
const track=root.querySelector('.partner-track'),buttons=[...root.querySelectorAll('[data-partner-page]')],slides=[...track.children],status=root.querySelector('.partner-page-status');
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let page=0,frame=0,timer=0,paused=false;
function fit(){const height=Math.max(...slides.map(slide=>slide.offsetHeight));if(height&&track.style)track.style.height=(height+2)+"px";}
function select(index){page=Math.max(0,Math.min(slides.length-1,index));buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===page)));status.textContent=(page+1).toString().padStart(2,'0')+' / 02 · '+(page?'Our partners':'Become a partner');fit();}
function schedule(){clearTimeout(timer);if(!paused&&!document.hidden)timer=setTimeout(()=>go((page+1)%slides.length),5000);}
function go(index){select(index);track.scrollTo({left:page*track.clientWidth,behavior:reduced()?'instant':'smooth'});schedule();}
buttons.forEach((button,i)=>button.addEventListener('click',()=>go(i)));
track.addEventListener('scroll',()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;if(track.clientWidth)select(Math.round(track.scrollLeft/track.clientWidth))})},{passive:true});
track.addEventListener('keydown',event=>{if(event.target!==track||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();go(event.key==='Home'?0:event.key==='End'?1:page+(event.key==='ArrowRight'?1:-1));});
track.addEventListener('pointerdown',()=>clearTimeout(timer));
track.addEventListener('pointerup',schedule);
track.addEventListener('pointercancel',schedule);
const toggle=document.createElement('button');toggle.type='button';toggle.className='partner-autoplay';toggle.textContent='Pause auto';toggle.setAttribute('aria-label','Pause automatic partner slides');
toggle.addEventListener('click',()=>{paused=!paused;toggle.textContent=paused?'Play auto':'Pause auto';toggle.setAttribute('aria-label',paused?'Resume automatic partner slides':'Pause automatic partner slides');schedule();});root.append(toggle);
document.addEventListener('visibilitychange',schedule);
new ResizeObserver(()=>{track.scrollTo({left:page*track.clientWidth,behavior:'instant'});fit()}).observe(track);
const slideObserver=new ResizeObserver(fit);slides.forEach(slide=>slideObserver.observe(slide));
select(0);
schedule();
})();
