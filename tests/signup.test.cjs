const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const handler=require('../api/early-access');
const payload={email:'driver@example.com',phone:'012 345 6789',region:'penang',role:'Car enthusiast',audience:'community',consent:'on',submissionId:'12345678-1234-1234-1234-123456789abc'};
test('browser bounds submission, clears slow notice timer and does not automatically retry',async()=>{
 for(const status of [200,400,409,502,503,504,'network']){
  let calls=0,cleared=false,timeout=0,slowDelay=0;
  const body=JSON.stringify(payload);
  const context={window:{},AbortSignal:{timeout:ms=>{timeout=ms;return undefined}},setTimeout:(fn,ms)=>{slowDelay=ms;return 42},clearTimeout:id=>{assert.equal(id,42);cleared=true},fetch:async(url,options)=>{calls++;assert.equal(options.body,body);if(status==='network')throw Error('offline');return {status}}};
  vm.createContext(context);vm.runInContext(fs.readFileSync('dist/signup-request.js','utf8'),context);
  if(status==='network')await assert.rejects(context.window.TTSpotRegistrationRequest(body,()=>{}));
  else assert.equal((await context.window.TTSpotRegistrationRequest(body,()=>{})).status,status);
  assert.equal(calls,1);assert(cleared);assert.equal(timeout,35000);assert.equal(slowDelay,4000);
 }
});
async function call(body=payload,method='POST',origin='https://ttspotwebsite.vercel.app') {
  const result={headers:{}};
  await handler({method,headers:{origin,'content-type':'application/json'},body},{setHeader(k,v){result.headers[k]=v},status(code){result.status=code;return this},json(data){result.data=data}});
  return result;
}
test('slow registration gives feedback by four seconds without reporting success or resubmitting',async()=>{
 let tick,finish,delay,feedback=0,settled=false,calls=0,cleared=false;
 const context={window:{},AbortSignal,setTimeout:(fn,ms)=>{tick=fn;delay=ms;return 1},clearTimeout:()=>{cleared=true},fetch:()=>{calls++;return new Promise(resolve=>finish=resolve)}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('dist/signup-request.js','utf8'),context);
 const request=context.window.TTSpotRegistrationRequest(JSON.stringify(payload),()=>feedback++).then(r=>{settled=true;return r});
 assert(delay<=5000);tick();assert.equal(feedback,1);assert.equal(settled,false);assert.equal(calls,1);
 finish({status:409});assert.equal((await request).status,409);assert(cleared);
});
test('registration API validates and only confirms a verified Google write',async()=>{
 const originalFetch=global.fetch;
 const saved={...process.env};
 try {
  delete process.env.SIGNUP_SCRIPT_URL;delete process.env.SIGNUP_SCRIPT_SECRET;
  assert.equal((await call()).status,503);
  assert.deepEqual((await call(null,'GET')).data,{configured:false});
  process.env.SIGNUP_SCRIPT_URL='https://script.google.com/macros/s/test/exec';process.env.SIGNUP_SCRIPT_SECRET='x'.repeat(48);
  let requests=0;
  global.fetch=async(url,options)=>{requests++;const sent=JSON.parse(options.body);assert.equal(sent.secret,'x'.repeat(48));assert.equal(sent.phone,'+60123456789');assert.equal(typeof sent.consent,'boolean');return{ok:true,json:async()=>({success:true,submissionId:sent.submissionId})}};
  assert.equal((await call({...payload,phone:''})).status,400);
  assert.equal((await call({...payload,phone:'abc0123456789'})).status,400);
  assert.equal((await call({...payload,region:'invalid'})).status,400);
  assert.equal((await call({...payload,email:'invalid'})).status,400);
  assert.equal((await call({...payload,website:'spam'})).status,400);
  assert.equal((await call({...payload,audience:'vendor'})).status,400);
  assert.equal((await call(payload,'POST','https://other.example')).status,403);
  assert.equal((await call({},'DELETE')).status,405);
  assert.equal((await call({padding:'x'.repeat(9000)})).status,413);
  assert.equal(requests,0);
  for (const origin of ['https://www.ttspot.my','https://ttspot.my']) assert.equal((await call(payload,'POST',origin)).status,200);
  const good=await call();assert.equal(good.status,200);assert.deepEqual(good.data,{success:true});
  assert.equal((await call({...payload,audience:'vendor',role:'Automotive business',businessName:'TT Workshop',businessCategory:'Workshop / performance'})).status,200);
  assert.equal((await call({...payload,consent:undefined})).status,200);
  global.fetch=async()=>({ok:true,json:async()=>({success:false,code:'duplicate'})});assert.equal((await call()).status,409);
  global.fetch=async()=>({ok:true,json:async()=>({success:false})});assert.equal((await call()).status,502);
  global.fetch=async()=>({ok:true,json:async()=>({success:true,submissionId:'wrong'})});assert.equal((await call()).status,502);
  global.fetch=async()=>{throw Error('upstream secret or personal data')};const failed=await call();assert.equal(failed.status,502);assert(!JSON.stringify(failed).includes('upstream secret'));
 } finally {global.fetch=originalFetch;for(const key of ['SIGNUP_SCRIPT_URL','SIGNUP_SCRIPT_SECRET']){if(saved[key]===undefined)delete process.env[key];else process.env[key]=saved[key]}}
});

test('receiver preserves legacy rows, detects email/phone duplicates and creates role views',()=>{
 const sheets={};let locked=false;
 function makeSheet(){const rows=[],formulas={};return {rows,formulas,getLastRow:()=>rows.length,setFrozenRows(){},setColumnWidths(){},setColumnWidth(){},getRange(r,c,h=1,w=1){const range={setValues(values){values.forEach((row,i)=>{rows[r-1+i] ||= [];row.forEach((v,j)=>rows[r-1+i][c-1+j]=v)});return range},setValue(v){return range.setValues([[v]])},getValues(){return Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>rows[r-1+i]?.[c-1+j]??''))},setFormula(f){formulas[r+','+c]=f;return range},setNote(){return range},setFontWeight(){return range},setBackground(){return range},setFontColor(){return range},setNumberFormat(){return range}};return range}}}
 const book={getSheetByName:n=>sheets[n]||null,insertSheet:n=>(sheets[n]=makeSheet())};
 const context={ContentService:{MimeType:{JSON:'json'},createTextOutput:v=>({setMimeType:()=>JSON.parse(v)})},PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'x'.repeat(48)})},LockService:{getScriptLock:()=>({waitLock(){locked=true},hasLock:()=>locked,releaseLock(){locked=false}})},SpreadsheetApp:{openById:()=>book,flush(){}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('integrations/google-sheets/Code.gs','utf8'),context);
 context.setupRegistrationSheets();assert.equal(Object.keys(sheets).length,6);
 assert(sheets.Creators.formulas['2,1'].includes('Creator'));assert(sheets.General.formulas['2,1'].includes('F2:F=""'));
 const submit=d=>context.doPost({postData:{contents:JSON.stringify(d)}});
 const data={...payload,consent:false,secret:'x'.repeat(48),businessName:'=BAD()'};
 assert.equal(submit({...data,secret:'bad'}).success,false);
 assert.equal(submit({...data,phone:''}).success,false);
 assert.equal(submit(data).success,true);assert.equal(locked,false);
 const rows=sheets.Registrations.rows;assert.equal(rows.length,2);assert.equal(rows[1][8],'No');assert(rows[1][6].startsWith("'="));
 assert.equal(submit(data).success,true);assert.equal(rows.length,2);
 const next={...data,submissionId:'87654321-1234-1234-1234-123456789abc'};
 assert.equal(submit({...next,email:'DRIVER@EXAMPLE.COM',phone:'+601199999999'}).code,'duplicate');
 assert.equal(submit({...next,email:'other@example.com',phone:'0060 12-345-6789'}).code,'duplicate');assert.equal(rows.length,2);
 assert.equal(submit({...data,email:'changed@example.com'}).success,false);
 rows[0].pop();rows[1].pop();context.setupRegistrationSheets();assert.equal(rows[0][11],'Phone');assert.equal(rows[1][2],'driver@example.com');
 assert.equal(submit({...next,phone:'+601188888888'}).code,'duplicate');
 rows[0][0]='Unrelated';assert.equal(submit(next).success,false);
});
