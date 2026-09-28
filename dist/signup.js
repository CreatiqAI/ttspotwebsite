/* Same-origin registration; the Google receiver and its secret live on the server. */
(() => {
  const form=document.querySelector('#early-access form');
  const submit=form.querySelector('[type=submit]');
  const notice=document.querySelector('#early-access .demo');
  const dialog=document.querySelector('#early-access'),ending=dialog.querySelector('.signup-ending');
  function resetView(){dialog.classList.remove('completed');ending.hidden=true;dialog.setAttribute('aria-labelledby','form-title');}
  dialog.querySelector('.ending-close').addEventListener('click',()=>dialog.querySelector('.close').click());
  let pending=false, lastPayload='', submissionId='';
  // Format on blur so editing and cursor movement stay predictable.
  form.elements.phone.addEventListener('blur',()=>{
    const input=form.elements.phone;
    let phone=input.value.trim().replace(/[\s().-]/g,'');
    if(phone.startsWith('00'))phone='+'+phone.slice(2);
    else if(phone.startsWith('0'))phone='+60'+phone.slice(1);
    else if(phone.startsWith('60'))phone='+'+phone;
    const match=phone.match(/^\+60(1\d)(\d{3,4})(\d{4})$/);
    if(match)input.value='+60'+match[1]+'-'+match[2]+' '+match[3];
  });
  async function availability() {
    try {
      const response=await fetch('/api/early-access',{cache:'no-store',signal:AbortSignal.timeout(8000)});
      const data=await response.json();
      return response.ok && data.configured===true;
    } catch { return false; }
  }
  const ready=availability().then(configured=>{
    notice.textContent=configured?'Your details will be saved securely for TTSpot early access or vendor updates, according to your selection.':'Registration is temporarily unavailable. Please check back soon.';
    notice.hidden=false;
    return configured;
  });
  window.TTSpotSignup={resetView,submit:async(audience)=>{
    if(pending)return;
    const message=form.querySelector('.message');
    pending=true;submit.disabled=true;submit.textContent='SUBMITTING…';message.textContent='';
    const payload={...Object.fromEntries(new FormData(form)),audience};
    let phone=(payload.phone||'').replace(/[\s().-]/g,'');
    if(phone.startsWith('00'))phone='+'+phone.slice(2);else if(phone.startsWith('0'))phone='+60'+phone.slice(1);else if(phone.startsWith('60'))phone='+'+phone;
    if(!/^[+\d\s().-]+$/.test(payload.phone||'')||!/^\+[1-9]\d{7,14}$/.test(phone)){
      form.querySelector('#phone-error').textContent='Enter a valid phone number, including country code for non-Malaysian numbers.';form.elements.phone.setAttribute('aria-invalid','true');form.elements.phone.focus();pending=false;submit.disabled=false;submit.textContent=audience==='vendor'?'REGISTER VENDOR INTEREST':'REGISTER MY INTEREST';return;
    }
    payload.phone=phone;
    const key=JSON.stringify(payload);
    if(key!==lastPayload){lastPayload=key;submissionId=crypto.randomUUID();}
    try {
      if(!await ready && !await availability())throw Error('Registration is temporarily unavailable. Please try again later.');
      const response=await window.TTSpotRegistrationRequest(JSON.stringify({...payload,submissionId}),()=>{
        submit.textContent='CONFIRMING…';message.textContent='The connection is taking longer than usual. Checking your registration again…';
      });
      const result=await response.json().catch(()=>({}));
      if(response.status===409 && result.code==='duplicate')throw Error('This email or phone number is already registered. 此邮箱或电话号码已登记。');
      if(!response.ok || result.success!==true)throw Error(response.status===400?'Please check your email, phone number and required details.':response.status===503?'Registration is temporarily unavailable. Please try again later.':'The registration service could not confirm your entry. Please retry shortly; the same entry will not be added twice. 暂时无法确认登记，请稍后重试。');
      ending.querySelector('.ending-copy').textContent=audience==='vendor'?'Your partnership interest is registered. Your next chapter with TTSpot starts here.':'You’re on the early-access list. Jom, be part of Malaysia’s car community.';
      ending.querySelector('.ending-updates').textContent=payload.consent==='on'?'You’ve opted in to TTSpot email updates.':'Your registration is saved. You haven’t subscribed to marketing emails.';
      ending.hidden=false;dialog.classList.add('completed');dialog.setAttribute('aria-labelledby','signup-ending-title');dialog.scrollTop=0;ending.querySelector('h2').focus();
      form.reset();form.elements.role.value=payload.role;lastPayload='';submissionId='';
    } catch(error) {
      message.textContent=error.message==='Failed to fetch'||error.name==='TimeoutError'?'We couldn’t confirm your registration. Please check your connection and retry.':error.message;
    } finally {
      pending=false;submit.disabled=false;submit.textContent=audience==='vendor'?'REGISTER VENDOR INTEREST':'REGISTER MY INTEREST';
    }
  }};
})();
