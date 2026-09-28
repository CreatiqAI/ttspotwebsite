/* Mobile event cards open the existing autoshow filter, keeping one map instance. */
(()=>{
 document.querySelectorAll('.mobile-events a').forEach(link=>link.addEventListener('click',()=>{
  if(matchMedia('(max-width:760px)').matches)document.querySelector('.map-option[data-map="checkpoints"]')?.click();
 }));
})();
