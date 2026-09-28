/* One bounded attempt. Manual retries retain the submission ID in signup.js. */
window.TTSpotRegistrationRequest = async function(body, onSlow) {
  const slow=setTimeout(onSlow,6000);
  try {
    return await fetch('/api/early-access', {
      method:'POST', headers:{'Content-Type':'application/json'}, body,
      signal:AbortSignal.timeout(35000)
    });
  } finally { clearTimeout(slow); }
};
