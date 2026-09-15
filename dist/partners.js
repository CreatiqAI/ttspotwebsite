(()=>{
const root=document.querySelector('.partner-carousel');if(!root)return;
const track=root.querySelector('.partner-track'),buttons=[...root.querySelectorAll('[data-partner-page]')],slides=[...track.children],status=root.querySelector('.partner-page-status');
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let page=0,frame=0;
function select(index){page=Math.max(0,Math.min(slides.length-1,index));buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===page)));status.textContent=(page+1).toString().padStart(2,'0')+' / 02 · '+(page?'Our partners':'Become a partner');}
function go(index){select(index);track.scrollTo({left:page*track.clientWidth,behavior:reduced()?'instant':'smooth'});}
buttons.forEach((button,i)=>button.addEventListener('click',()=>go(i)));
track.addEventListener('scroll',()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;if(track.clientWidth)select(Math.round(track.scrollLeft/track.clientWidth))})},{passive:true});
track.addEventListener('keydown',event=>{if(event.target!==track||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();go(event.key==='Home'?0:event.key==='End'?1:page+(event.key==='ArrowRight'?1:-1));});
new ResizeObserver(()=>track.scrollTo({left:page*track.clientWidth,behavior:'instant'})).observe(track);
select(0);
})();
