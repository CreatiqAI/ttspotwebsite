// Server-only bridge: Google deployment URL and shared secret never reach the browser.
const REGIONS = ['kl-selangor', 'johor', 'penang'];
const ROLES = ['', 'Car enthusiast', 'Creator', 'Club organiser', 'Automotive business'];
const CATEGORIES = ['Workshop / performance', 'Detailing / car wash', 'Tyres / rims', 'Tint / PPF / wraps', 'Accessories / car care', 'Automotive café', 'Other automotive business'];
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const reply = (code, data) => res.status(code).json(data);
  const endpoint = process.env.SIGNUP_SCRIPT_URL || '';
  const secret = process.env.SIGNUP_SCRIPT_SECRET || '';
  const configured = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint) && secret.length >= 32;
  if (req.method === 'GET') return reply(200, {configured});
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return reply(405, {success:false}); }
  const origins = new Set(['https://ttspotwebsite.vercel.app', 'https://www.ttspot.my', 'https://ttspot.my', ...(process.env.SIGNUP_ALLOWED_ORIGINS || '').split(',').map(x=>x.trim()).filter(Boolean)]);
  if (process.env.NODE_ENV !== 'production') origins.add('http://127.0.0.1:4173');
  if (!origins.has(req.headers.origin)) return reply(403, {success:false});
  if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) return reply(415, {success:false});
  if (!configured) return reply(503, {success:false, message:'Registration is temporarily unavailable. Please try again later.'});
  let data;
  try {
    if (Number(req.headers['content-length']) > 8192) return reply(413, {success:false});
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (!raw || Buffer.byteLength(raw) > 8192) return reply(413, {success:false});
    data = JSON.parse(raw);
  } catch { return reply(400, {success:false}); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return reply(400, {success:false});
  const text = (key, limit) => typeof data[key] === 'string' && data[key].length <= limit ? data[key].trim() : null;
  const email=text('email',254), region=text('region',30), role=text('role',50), audience=text('audience',20);
  const businessName=text('businessName',120) || '', businessCategory=text('businessCategory',80) || '';
  const submissionId=text('submissionId',36);
  if (data.website || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !REGIONS.includes(region) || !ROLES.includes(role) ||
      !['community','vendor'].includes(audience) || data.consent !== 'on' || !/^[a-f\d-]{36}$/i.test(submissionId || '') ||
      (audience==='vendor' && (!businessName || !CATEGORIES.includes(businessCategory) || role!=='Automotive business')) ||
      (audience==='community' && role==='Automotive business')) return reply(400, {success:false, message:'Please check your details and consent.'});
  try {
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret,submissionId,email:email.toLowerCase(),region,role,audience,businessName:audience==='vendor'?businessName:'',businessCategory:audience==='vendor'?businessCategory:'',consent:true}),signal:AbortSignal.timeout(18000)});
    const result=await response.json();
    if (!response.ok || result.success!==true || result.submissionId!==submissionId) throw Error('unconfirmed');
    return reply(200,{success:true});
  } catch {
    // Do not log visitor data, credentials or upstream responses.
    return reply(502,{success:false,message:'We couldn’t confirm your registration. Please retry; retrying the same entry will not add a duplicate.'});
  }
};
