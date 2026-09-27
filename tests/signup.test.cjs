const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const handler=require('../api/early-access');
const payload={email:'driver@example.com',region:'penang',role:'Car enthusiast',audience:'community',consent:'on',submissionId:'12345678-1234-1234-1234-123456789abc'};
async function call(body=payload,method='POST',origin='https://ttspotwebsite.vercel.app') {
  const result={headers:{}};
  await handler({method,headers:{origin,'content-type':'application/json'},body},{setHeader(k,v){result.headers[k]=v},status(code){result.status=code;return this},json(data){result.data=data}});
  return result;
}
test('registration API validates and only confirms a verified Google write',async()=>{
 const originalFetch=global.fetch;
 const saved={...process.env};
 try {
  delete process.env.SIGNUP_SCRIPT_URL;delete process.env.SIGNUP_SCRIPT_SECRET;
  assert.equal((await call()).status,503);
  assert.deepEqual((await call(null,'GET')).data,{configured:false});
  process.env.SIGNUP_SCRIPT_URL='https://script.google.com/macros/s/test/exec';process.env.SIGNUP_SCRIPT_SECRET='x'.repeat(48);
  let requests=0;
  global.fetch=async(url,options)=>{requests++;const sent=JSON.parse(options.body);assert.equal(sent.secret,'x'.repeat(48));return{ok:true,json:async()=>({success:true,submissionId:sent.submissionId})}};
  assert.equal((await call({...payload,consent:false})).status,400);
  assert.equal((await call({...payload,region:'invalid'})).status,400);
  assert.equal((await call({...payload,email:'invalid'})).status,400);
  assert.equal((await call({...payload,website:'spam'})).status,400);
  assert.equal((await call({...payload,audience:'vendor'})).status,400);
  assert.equal((await call(payload,'POST','https://other.example')).status,403);
  assert.equal((await call({},'DELETE')).status,405);
  assert.equal((await call({padding:'x'.repeat(9000)})).status,413);
  assert.equal(requests,0);
  const good=await call();assert.equal(good.status,200);assert.deepEqual(good.data,{success:true});
  assert.equal((await call({...payload,audience:'vendor',role:'Automotive business',businessName:'TT Workshop',businessCategory:'Workshop / performance'})).status,200);
  global.fetch=async()=>({ok:true,json:async()=>({success:false})});assert.equal((await call()).status,502);
  global.fetch=async()=>({ok:true,json:async()=>({success:true,submissionId:'wrong'})});assert.equal((await call()).status,502);
  global.fetch=async()=>{throw Error('upstream secret or personal data')};const failed=await call();assert.equal(failed.status,502);assert(!JSON.stringify(failed).includes('upstream secret'));
 } finally {global.fetch=originalFetch;for(const key of ['SIGNUP_SCRIPT_URL','SIGNUP_SCRIPT_SECRET']){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key]}}
});
test('Google receiver serializes writes, deduplicates retries and protects formulas',()=>{
 let rows=[],locked=false,flushes=0;
 const range=(r,c,h,w)=>({setValues(v){assert(locked);v.forEach((row,i)=>rows[r-1+i]=[...row]);return this},getValues(){return rows.slice(r-1,r-1+h)},setFontWeight(){return this},setBackground(){return this},setFontColor(){return this},setNumberFormat(){return this},createTextFinder(id){return{matchEntireCell(){return this},findNext(){return rows.slice(1).some(row=>row[0]===id)?{}:null}}}});
 const sheet={getLastRow:()=>rows.length,getRange:range,setFrozenRows(){},setColumnWidths(){},setColumnWidth(){}};
 const context={ContentService:{MimeType:{JSON:'json'},createTextOutput(value){return{setMimeType:()=>JSON.parse(value)}}},PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'x'.repeat(48)})},LockService:{getScriptLock:()=>({waitLock(){locked=true},hasLock:()=>locked,releaseLock(){locked=false}})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>rows.length?sheet:null,insertSheet:()=>sheet}),flush(){flushes++}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('integrations/google-sheets/Code.gs','utf8'),context);
 const submit=data=>context.doPost({postData:{contents:JSON.stringify(data)}});
 const data={...payload,consent:true,secret:'x'.repeat(48),businessName:'=IMPORTXML("https://bad.example")'};
 assert.equal(submit({...data,secret:'wrong'}).success,false);assert.equal(rows.length,0);
 assert.equal(submit(data).success,true);assert.equal(rows.length,2);assert.equal(locked,false);assert.equal(flushes,1);
 assert(rows[1][6].startsWith("'="));assert.equal(rows[1][8],'Yes');
 assert.equal(submit(data).success,true);assert.equal(rows.length,2);
 rows[0][0]='Existing unrelated data';assert.equal(submit({...data,submissionId:'87654321-1234-1234-1234-123456789abc'}).success,false);assert.equal(rows.length,2);
});
