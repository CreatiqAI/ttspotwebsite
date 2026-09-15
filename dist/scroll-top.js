(()=>{
 const button=document.querySelector('.scroll-top');
 if(!button)return;
 const ring=button.querySelector('.scroll-top__fill'),label=button.querySelector('.scroll-top__percent');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,previous=-1;
 function update(){frame=0;const page=document.scrollingElement||document.documentElement,max=Math.max(0,page.scrollHeight-page.clientHeight),progress=max>0?Math.max(0,Math.min(100,page.scrollTop/max*100)):0,percent=Math.round(progress);ring.style.strokeDashoffset=String(100-progress);if(percent!==previous){previous=percent;label.textContent=percent+'%';button.setAttribute('aria-label','Back to top — '+percent+'% of page scrolled');button.title='Back to top · '+percent+'%';}}
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 button.addEventListener('click',()=>{window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'});if(location.hash)history.replaceState(null,'',location.pathname+location.search+'#regions');});
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('pageshow',schedule);new ResizeObserver(schedule).observe(document.body);document.fonts?.ready.then(schedule);schedule();
})();
