/* Same-origin registration; the Google receiver and its secret live on the server. */
(() => {
  const form=document.querySelector('#early-access form');
  const submit=form.querySelector('[type=submit]');
  const notice=document.querySelector('#early-access .demo');
  let pending=false, lastPayload='', submissionId='';
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
  window.TTSpotSignup={submit:async(audience)=>{
    if(pending)return;
    const message=form.querySelector('.message');
    pending=true;submit.disabled=true;submit.textContent='SUBMITTING…';message.textContent='';
    const payload={...Object.fromEntries(new FormData(form)),audience};
    const key=JSON.stringify(payload);
    if(key!==lastPayload){lastPayload=key;submissionId=crypto.randomUUID();}
    try {
      if(!await ready && !await availability())throw Error('Registration is temporarily unavailable. Please try again later.');
      const response=await fetch('/api/early-access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,submissionId}),signal:AbortSignal.timeout(55000)});
      const result=await response.json();
      if(!response.ok || result.success!==true)throw Error(response.status===503?'Registration is temporarily unavailable. Please try again later.':'We couldn’t confirm your registration. Please retry.');
      message.textContent=audience==='vendor'?'Your partnership interest has been received. We’ll email you about next steps.':'You’re on the list. We’ll email you about launch and early access.';
      form.reset();form.elements.role.value=payload.role;lastPayload='';submissionId='';
    } catch(error) {
      message.textContent=error.message==='Failed to fetch'||error.name==='TimeoutError'?'We couldn’t confirm your registration. Please check your connection and retry.':error.message;
    } finally {
      pending=false;submit.disabled=false;submit.textContent=audience==='vendor'?'REGISTER VENDOR INTEREST':'REGISTER MY INTEREST';
    }
  }};
})();
