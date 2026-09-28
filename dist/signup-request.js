/* Retry an unconfirmed request once, keeping its ID and data identical. */
window.TTSpotRegistrationRequest = async function(body, onRetry) {
  for (let attempt=0; attempt<2; attempt++) {
    try {
      const response=await fetch('/api/early-access', {
        method:'POST', headers:{'Content-Type':'application/json'}, body,
        signal:AbortSignal.timeout(55000)
      });
      if(attempt===1 || ![502,504].includes(response.status)) return response;
    } catch(error) {
      if(attempt===1) throw error;
    }
    onRetry();
    await new Promise(resolve=>setTimeout(resolve,1000));
  }
};
