/* Phones: tappable chips mirror each native <select> in the sign-up form.
   The select keeps the value and is what the form submits, so field names and values never change.
   Chips are created hidden; only mobile-v2.css (max-width:760px) shows them and hides the select. */
(function(){
function TTSpotChoiceChips(select,doc){
 doc=doc||document;
 const group=doc.createElement('div');group.className='m-choice';group.hidden=true;group.setAttribute('role','group');
 const label=select.labels&&select.labels[0]?select.labels[0].textContent:select.getAttribute('aria-label')||'';
 if(label)group.setAttribute('aria-label',label.replace(/\*|\(optional\)/g,'').trim());
 const chips=[];
 function sync(){chips.forEach(chip=>chip.setAttribute('aria-pressed',String(chip.dataset.value===select.value)))}
 Array.prototype.forEach.call(select.options,option=>{
  if(!option.value)return;
  const chip=doc.createElement('button');chip.type='button';chip.className='m-choice-chip';chip.textContent=option.text;chip.dataset.value=option.value;
  chip.addEventListener('click',()=>{select.value=option.value;select.dispatchEvent(new Event('change',{bubbles:true}));sync()});
  chips.push(chip);group.append(chip);
 });
 select.after(group);select.classList.add('has-choice-chips');select.addEventListener('change',sync);sync();
 return {group,chips,sync};
}
if(typeof window!=='undefined')window.TTSpotChoiceChips=TTSpotChoiceChips;
if(typeof document==='undefined'||!document.querySelector)return;
const dialog=document.querySelector('#early-access');if(!dialog)return;
const sets=Array.prototype.map.call(dialog.querySelectorAll('select'),select=>TTSpotChoiceChips(select,document));
const syncAll=()=>sets.forEach(set=>set.sync());
/* Values are set in code when the dialog opens or the form resets; refresh the chips then. */
new MutationObserver(syncAll).observe(dialog,{attributes:true,attributeFilter:['open','class']});
dialog.querySelector('form')?.addEventListener('reset',()=>setTimeout(syncAll));
})();
