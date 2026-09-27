/** TTSpot registration receiver. Keep the shared secret in Script Properties. */
const SPREADSHEET_ID = '13CY3EgUu0dLV1n1FwchzOwji7GpveAnVy6iij4YnvCE';
const TAB_NAME = 'Registrations';
const HEADERS = ['Submission ID','Submitted at (UTC)','Email','Region','Audience','Role','Business name','Business category','Consent','Consent text','Source'];
function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return json_({service:'TTSpot registrations'}); }
function doPost(e) {
  let lock;
  try {
    if (!e || !e.postData || e.postData.contents.length > 8192) return json_({success:false});
    const data=JSON.parse(e.postData.contents);
    const secret=PropertiesService.getScriptProperties().getProperty('SIGNUP_SCRIPT_SECRET');
    if (!secret || secret.length<32 || data.secret!==secret) return json_({success:false});
    if (!/^[a-f\d-]{36}$/i.test(data.submissionId || '') || typeof data.email!=='string' || data.email.length>254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.consent!==true ||
        !['kl-selangor','johor','penang'].includes(data.region) || !['community','vendor'].includes(data.audience)) return json_({success:false});
    lock=LockService.getScriptLock();lock.waitLock(10000);
    const book=SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet=book.getSheetByName(TAB_NAME) || book.insertSheet(TAB_NAME);
    if (!sheet.getLastRow()) {
      sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#b50024').setFontColor('#ffffff');
      sheet.setFrozenRows(1);sheet.setColumnWidths(1,HEADERS.length,170);sheet.setColumnWidth(3,250);sheet.setColumnWidth(10,400);
    }
    const existingHeaders=sheet.getRange(1,1,1,HEADERS.length).getValues()[0];
    if (JSON.stringify(existingHeaders)!==JSON.stringify(HEADERS)) return json_({success:false});
    const last=sheet.getLastRow();
    if(last>1 && sheet.getRange(2,1,last-1,1).createTextFinder(data.submissionId).matchEntireCell(true).findNext()) return json_({success:true,submissionId:data.submissionId});
    // Escape spreadsheet formulas, including values later exported as CSV.
    const safe=value=>{const s=String(value || '').slice(0,500);return /^[\s]*[=+@-]/.test(s)?"'"+s:s;};
    const consentText=data.audience==='vendor'?'Email me about TTSpot vendor opportunities and partnerships.':'Email me about TTSpot’s launch and early access.';
    const row=[data.submissionId,new Date().toISOString(),data.email,data.region,data.audience,data.role,data.businessName,data.businessCategory,'Yes',consentText,'ttspotwebsite.vercel.app'];
    sheet.getRange(last+1,1,1,HEADERS.length).setNumberFormat('@').setValues([row.map(safe)]);
    SpreadsheetApp.flush();
    return json_({success:true,submissionId:data.submissionId});
  } catch(error) { return json_({success:false}); }
  finally { if(lock && lock.hasLock())lock.releaseLock(); }
}
