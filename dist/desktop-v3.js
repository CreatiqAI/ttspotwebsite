/* Desktop and tablet (761px and wider) behaviour for the sections shared with phones.
   The pinned "How it works" steps and the card viewer are driven by mobile-v2.js and card-viewer.js. */
(()=>{
const wide=matchMedia('(min-width:761px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
/* Event and meet-spot cards open the CarPlay map above on the matching category. */
document.querySelectorAll('.mobile-events [data-open-map]').forEach(el=>el.addEventListener('click',event=>{
 if(!wide.matches)return;event.preventDefault();
 document.querySelector('#live-map')?.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});
 document.querySelector('.map-option[data-map="'+el.dataset.openMap+'"]')?.click();
}));
/* Light fade/slide reveal for the new sections (300 ms; off with reduced motion). */
if(wide.matches&&!reduced.matches&&'IntersectionObserver' in window){
 const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('m-in');io.unobserve(entry.target)}}),{rootMargin:'0px 0px -8% 0px',threshold:.01});
 document.querySelectorAll('.m-what-head,.m-what .app-tile,.mobile-events h2,.mobile-events .mobile-events-note,.mobile-events .mobile-map-cta,.m-events-track li').forEach(el=>{
  const siblings=[...el.parentElement.children].filter(c=>c.tagName===el.tagName);el.style.setProperty('--m-delay',Math.min(3,siblings.indexOf(el))*70+'ms');
  el.classList.add('m-reveal');io.observe(el);
 });
}
})();
