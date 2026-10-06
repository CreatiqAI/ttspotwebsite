/* Desktop and tablet: a styled dropdown mirrors each native <select> in the sign-up form (owner, 2026-10-06: the browser's own list looked plain).
   The select keeps the value and is what the form submits, so field names and values never change.
   Menus are created hidden; only desktop-v3.css (min-width:761px) shows them and visually hides the select. Phones use form-chips.js. */
(function(){
let uid=0;
function TTSpotSelectMenu(select,doc){
 doc=doc||document;
 const id='dsel-'+(++uid);
 const wrap=doc.createElement('div');wrap.className='d-select';wrap.hidden=true;
 const button=doc.createElement('button');button.type='button';button.className='d-select-button';button.id=id+'-button';
 button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',id+'-list');
 const value=doc.createElement('span');value.className='d-select-value';
 const chevron=doc.createElement('span');chevron.className='d-select-chevron';chevron.setAttribute('aria-hidden','true');
 button.append(value);button.append(chevron);
 const list=doc.createElement('ul');list.className='d-select-list';list.id=id+'-list';list.setAttribute('role','listbox');list.tabIndex=-1;list.hidden=true;
 const label=select.labels&&select.labels[0];
 if(label){if(!label.id)label.id=id+'-label';button.setAttribute('aria-labelledby',label.id+' '+button.id);list.setAttribute('aria-labelledby',label.id)}
 const items=[];
 Array.prototype.forEach.call(select.options,(option,i)=>{
  if(!option.value)return;
  const item=doc.createElement('li');item.className='d-select-option';item.id=id+'-opt-'+i;item.setAttribute('role','option');item.dataset.value=option.value;item.textContent=option.text;
  item.addEventListener('click',()=>choose(item));
  item.addEventListener('mousemove',()=>setActive(items.indexOf(item)));
  items.push(item);list.append(item);
 });
 wrap.append(button);wrap.append(list);
 const placeholder=Array.prototype.find.call(select.options,option=>!option.value);
 let active=-1,escapedAt=0;
 function sync(){
  const option=select.options[select.selectedIndex],empty=!option||!option.value;
  const text=empty?(placeholder?placeholder.text:''):option.text;
  if(value.textContent!==text)value.textContent=text;
  button.classList.toggle('is-empty',empty);
  items.forEach(item=>{const on=String(item.dataset.value===select.value);if(item.getAttribute('aria-selected')!==on)item.setAttribute('aria-selected',on)});
  const invalid=select.getAttribute('aria-invalid');
  if(invalid&&button.getAttribute('aria-invalid')!==invalid)button.setAttribute('aria-invalid',invalid);
  else if(!invalid&&button.getAttribute('aria-invalid'))button.removeAttribute('aria-invalid');
 }
 function setActive(i){
  if(i<0||i>=items.length||i===active)return;active=i;
  items.forEach((item,j)=>item.classList.toggle('is-active',j===i));
  list.setAttribute('aria-activedescendant',items[i].id);
  if(items[i].scrollIntoView)items[i].scrollIntoView({block:'nearest'});
 }
 function open(){
  if(!list.hidden)return;
  list.hidden=false;wrap.classList.add('is-open');button.setAttribute('aria-expanded','true');
  /* Open upwards when the dialog has more room above the field than below it. */
  if(button.getBoundingClientRect){
   const box=(select.closest&&select.closest('dialog')||doc.documentElement).getBoundingClientRect(),r=button.getBoundingClientRect();
   const below=Math.min(innerHeight,box.bottom)-r.bottom,above=r.top-Math.max(0,box.top);
   wrap.classList.toggle('is-up',below<list.offsetHeight+12&&above>below);
  }
  active=-1;setActive(Math.max(0,items.findIndex(item=>item.dataset.value===select.value)));
  if(list.focus)list.focus();
  if(list.scrollIntoView)list.scrollIntoView({block:'nearest'});
  doc.addEventListener('pointerdown',outside,true);
 }
 function close(refocus){
  if(list.hidden)return;
  list.hidden=true;wrap.classList.remove('is-open');wrap.classList.remove('is-up');button.setAttribute('aria-expanded','false');
  doc.removeEventListener('pointerdown',outside,true);
  if(refocus&&button.focus)button.focus();
 }
 function outside(e){if(!wrap.contains(e.target))close(false)}
 function choose(item){
  if(select.value!==item.dataset.value){select.value=item.dataset.value;select.dispatchEvent(new Event('change',{bubbles:true}))}
  sync();close(true);
 }
 button.addEventListener('click',()=>list.hidden?open():close(true));
 button.addEventListener('keydown',e=>{if(['ArrowDown','ArrowUp','Enter',' '].includes(e.key)){e.preventDefault();open()}});
 list.addEventListener('keydown',e=>{
  const k=e.key;
  if(k==='ArrowDown'){e.preventDefault();setActive(Math.min(items.length-1,active+1))}
  else if(k==='ArrowUp'){e.preventDefault();setActive(Math.max(0,active-1))}
  else if(k==='Home'){e.preventDefault();setActive(0)}
  else if(k==='End'){e.preventDefault();setActive(items.length-1)}
  else if(k==='Enter'||k===' '){e.preventDefault();if(items[active])choose(items[active])}
  else if(k==='Escape'){e.preventDefault();e.stopPropagation();escapedAt=Date.now();close(true)}
  else if(k==='Tab')close(false);
  else if(k.length===1){const c=k.toLowerCase();for(let s=1;s<=items.length;s++){const j=(active+s)%items.length;if(items[j].textContent.trim().toLowerCase().startsWith(c)){setActive(j);break}}}
 });
 list.addEventListener('focusout',e=>{if(!wrap.contains(e.relatedTarget))close(false)});
 /* Escape closes only the menu, not the whole sign-up dialog. */
 const dialog=select.closest&&select.closest('dialog');
 if(dialog)dialog.addEventListener('cancel',e=>{if(Date.now()-escapedAt<400)e.preventDefault()});
 /* The label and the form's validation focus the select; send that focus to the menu button while the menu is showing. */
 select.tabIndex=-1;
 select.addEventListener('focus',()=>{if(wrap.offsetParent!==null&&button.focus)button.focus()});
 select.addEventListener('change',sync);
 select.after(wrap);select.classList.add('has-select-menu');sync();
 return {wrap,button,list,items,sync,open,close};
}
if(typeof window!=='undefined')window.TTSpotSelectMenu=TTSpotSelectMenu;
if(typeof document==='undefined'||!document.querySelector)return;
const dialog=document.querySelector('#early-access');if(!dialog)return;
const sets=Array.prototype.map.call(dialog.querySelectorAll('select'),select=>{
 const set=TTSpotSelectMenu(select,document);
 new MutationObserver(set.sync).observe(select,{attributes:true,attributeFilter:['aria-invalid']});
 return set;
});
/* Values are set in code when the dialog opens or the form resets; refresh the menus then, and close them with the dialog. */
new MutationObserver(()=>sets.forEach(set=>{set.sync();if(!dialog.open)set.close(false)})).observe(dialog,{attributes:true,attributeFilter:['open','class']});
dialog.querySelector('form')?.addEventListener('reset',()=>setTimeout(()=>sets.forEach(set=>set.sync())));
})();
