/** TTSpot receiver. Shared secret stays in Script Properties. */
const SPREADSHEET_ID='13CY3EgUu0dLV1n1FwchzOwji7GpveAnVy6iij4YnvCE';
const TAB_NAME='Registrations';
const HEADERS=['Submission ID','Submitted at (UTC)','Email','Region','Audience','Role','Business name','Business category','Consent','Consent text','Source','Phone'];
const ROLE_TABS={'Car Enthusiasts':'Car enthusiast','Creators':'Creator','Club Organisers':'Club organiser','Automotive Businesses':'Automotive business','General':''};
function json_(data){return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
function doGet(){return json_({service:'TTSpot registrations',version:2});}
function phone_(value){
  let p=String(value||'').replace(/^'/,'').replace(/[\s().-]/g,'');
  if(p.startsWith('00'))p='+'+p.slice(2);
  else if(p.startsWith('0'))p='+60'+p.slice(1);
  else if(p.startsWith('60'))p='+'+p;
  return /^\+[1-9]\d{7,14}$/.test(p)?p:'';
}
function formatHeader_(sheet){
  sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#b50024').setFontColor('#ffffff');
  sheet.setFrozenRows(1);sheet.setColumnWidths(1,HEADERS.length,170);sheet.setColumnWidth(3,280);sheet.setColumnWidth(10,400);sheet.setColumnWidth(12,180);
}
function master_(book){
  const sheet=book.getSheetByName(TAB_NAME)||book.insertSheet(TAB_NAME);
  if(!sheet.getLastRow())formatHeader_(sheet);
  const headers=sheet.getRange(1,1,1,HEADERS.length).getValues()[0];
  if(JSON.stringify(headers.slice(0,11))!==JSON.stringify(HEADERS.slice(0,11)))throw Error('Unexpected headers');
  if(!headers[11]){
    if(sheet.getLastRow()>1 && sheet.getRange(2,12,sheet.getLastRow()-1,1).getValues().some(r=>r[0]!==''))throw Error('Phone column occupied');
    sheet.getRange(1,12).setValue('Phone').setFontWeight('bold').setBackground('#b50024').setFontColor('#ffffff');sheet.setColumnWidth(12,180);
  }else if(headers[11]!=='Phone')throw Error('Unexpected phone header');
  return sheet;
}
// Run once from the editor. Category tabs are live views; edit records in Registrations.
function setupRegistrationSheets(){
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const book=SpreadsheetApp.openById(SPREADSHEET_ID);master_(book);
    Object.keys(ROLE_TABS).forEach(name=>{
      let tab=book.getSheetByName(name);
      if(tab && tab.getLastRow())return; // Preserve any existing user-managed tab.
      tab=tab||book.insertSheet(name);formatHeader_(tab);
      tab.getRange(2,1).setFormula('=IFERROR(FILTER(Registrations!A2:L,Registrations!A2:A<>"",Registrations!F2:F="'+ROLE_TABS[name]+'"),"")');
      tab.getRange(1,1).setNote('Automatically filtered from Registrations. Edit or remove records in the Registrations master tab.');
    });SpreadsheetApp.flush();
  }finally{lock.releaseLock();}
}
function doPost(e){
  let lock;
  try{
    if(!e||!e.postData||e.postData.contents.length>8192)return json_({success:false});
    const data=JSON.parse(e.postData.contents);
    const secret=PropertiesService.getScriptProperties().getProperty('SIGNUP_SCRIPT_SECRET');
    if(!secret||secret.length<32||data.secret!==secret)return json_({success:false});
    const phone=phone_(data.phone),email=String(data.email||'').trim().toLowerCase();
    if(!/^[a-f\d-]{36}$/i.test(data.submissionId||'')||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||!phone||typeof data.consent!=='boolean'||
      !['kl-selangor','johor','penang'].includes(data.region)||!['community','vendor'].includes(data.audience)||!Object.values(ROLE_TABS).includes(data.role))return json_({success:false});
    lock=LockService.getScriptLock();lock.waitLock(10000);
    const sheet=master_(SpreadsheetApp.openById(SPREADSHEET_ID));const last=sheet.getLastRow();
    const rows=last>1?sheet.getRange(2,1,last-1,HEADERS.length).getValues():[];
    // A retry of an acknowledged write is successful; new IDs cannot reuse either identifier.
    const previous=rows.find(r=>String(r[0])===data.submissionId);
    if(previous)return json_({success:String(previous[2]).trim().toLowerCase()===email&&phone_(previous[11])===phone,submissionId:data.submissionId});
    if(rows.some(r=>String(r[2]).trim().toLowerCase()===email||(phone_(r[11])&&phone_(r[11])===phone)))return json_({success:false,code:'duplicate'});
    const safe=value=>{const s=String(value||'').slice(0,500);return /^[\s]*[=+@-]/.test(s)?"'"+s:s;};
    const consentText=data.audience==='vendor'?'Email me about TTSpot vendor opportunities and partnerships.':'Email me about TTSpot’s launch and early access.';
    const row=[data.submissionId,new Date().toISOString(),email,data.region,data.audience,data.role,data.businessName,data.businessCategory,data.consent?'Yes':'No',consentText,'www.ttspot.my',phone];
    sheet.getRange(last+1,1,1,HEADERS.length).setNumberFormat('@').setValues([row.map(safe)]);SpreadsheetApp.flush();
    return json_({success:true,submissionId:data.submissionId});
  }catch(error){return json_({success:false});}finally{if(lock&&lock.hasLock())lock.releaseLock();}
}
