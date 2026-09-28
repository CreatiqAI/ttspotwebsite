// Server-only bridge: Google deployment URL and shared secret never reach the browser.
const REGIONS = ['kl-selangor', 'johor', 'penang'];
const ROLES = ['', 'Car enthusiast', 'Creator', 'Club organiser', 'Automotive business'];
const CATEGORIES = ['Workshop / performance', 'Detailing / car wash', 'Tyres / rims', 'Tint / PPF / wraps', 'Accessories / car care', 'Automotive café', 'Other automotive business'];
function normalizePhone(value) {
  if (typeof value !== 'string' || value.length > 40 || !/^[+\d\s().-]+$/.test(value)) return '';
  let phone=value.replace(/[\s().-]/g,'');
  if(phone.startsWith('00'))phone='+'+phone.slice(2);
  else if(phone.startsWith('0'))phone='+60'+phone.slice(1);
  else if(phone.startsWith('60'))phone='+'+phone;
  return /^\+[1-9]\d{7,14}$/.test(phone)?phone:'';
}
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
  const phone=normalizePhone(data.phone);
  if (data.website || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !REGIONS.includes(region) || !ROLES.includes(role) ||
      !['community','vendor'].includes(audience) || !phone || ![undefined,'on',false].includes(data.consent) || !/^[a-f\d-]{36}$/i.test(submissionId || '') ||
      (audience==='vendor' && (!businessName || !CATEGORIES.includes(businessCategory) || role!=='Automotive business')) ||
      (audience==='community' && role==='Automotive business')) return reply(400, {success:false, message:'Please check your email, phone number and required details.'});
  try {
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({secret,submissionId,phone,email:email.toLowerCase(),region,role,audience,businessName:audience==='vendor'?businessName:'',businessCategory:audience==='vendor'?businessCategory:'',consent:data.consent==='on'}),signal:AbortSignal.timeout(30000)});
    const result=await response.json();
    if(response.ok && result.code==='duplicate') return reply(409,{success:false,code:'duplicate',message:'This email or phone number is already registered. 此邮箱或电话号码已登记。'});
    if (!response.ok || result.success!==true || result.submissionId!==submissionId) throw Error('unconfirmed');
    return reply(200,{success:true});
  } catch {
    // Do not log visitor data, credentials or upstream responses.
    return reply(502,{success:false,message:'We couldn’t confirm your registration. Please retry; retrying the same entry will not add a duplicate.'});
  }
};
