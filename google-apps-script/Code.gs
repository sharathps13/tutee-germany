/**
 * Tutee Connect — website leads → Google Sheet + email to business@tuteeconnect.com
 *
 * Setup (once):
 *  1. Create a Google Sheet (signed in as a tuteeconnect.com account).
 *  2. Extensions → Apps Script → replace everything with this file → Save.
 *  3. Change SECRET below to any long random text (same value goes into Netlify).
 *  4. Deploy → New deployment → type "Web app"
 *       Execute as: Me      Who has access: Anyone
 *     → Authorize → copy the Web app URL.
 *  5. In Netlify add env vars LEADS_SHEET_URL (that URL) and LEADS_SHEET_SECRET (SECRET), then redeploy.
 *  If you edit this script later: Deploy → Manage deployments → Edit → Version: New version.
 */
const SECRET   = 'CHANGE-ME-to-a-long-random-text';
const NOTIFY   = 'business@tuteeconnect.com';
const SHEET    = 'Leads';
const HEADERS  = ['Received', 'Country', 'Name', 'Email', 'Phone', 'Programme', 'Based in',
                  'University', 'Details', 'Source', 'Page'];

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return out({ ok: false, error: 'bad json' }); }
  if (d.secret !== SECRET) return out({ ok: false, error: 'unauthorised' });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET);
    if (!sh) { sh = ss.insertSheet(SHEET); sh.appendRow(HEADERS); sh.setFrozenRows(1); sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold'); }
    sh.appendRow([new Date(), d.country, d.name, d.email, safe(d.phone), d.study_level, d.origin,
                  d.university, d.destination, d.source, d.page].map(v => v == null ? '' : v));
  } finally { lock.releaseLock(); }

  const lines = [
    'New enquiry from the website', '',
    'Name:        ' + (d.name || ''),
    'Email:       ' + (d.email || ''),
    'Phone:       ' + (d.phone || ''),
    'Country:     ' + (d.country || ''),
    'Programme:   ' + (d.study_level || ''),
    'Based in:    ' + (d.origin || ''),
    'University:  ' + (d.university || '-'),
    'Details:     ' + (d.destination || ''),
    'Page:        ' + (d.page || ''), '',
    'All leads: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl()
  ];
  const opts = { name: 'Tutee Connect Website' };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) opts.replyTo = d.email;
  MailApp.sendEmail(NOTIFY, 'New ' + (d.country || '') + ' enquiry: ' + (d.name || 'website lead'), lines.join('\n'), opts);

  return out({ ok: true });
}

// keep "+91 98…" from being read as a formula/number
function safe(v) { return v ? "'" + String(v) : ''; }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Run once from the editor to test: sends a sample lead.
function testLead() {
  doPost({ postData: { contents: JSON.stringify({ secret: SECRET, country: 'Germany', name: 'Test Lead',
    email: 'test@example.com', phone: '+91 9876543210', study_level: "Master's degree", origin: 'India',
    destination: 'Germany | test', source: 'Apps Script test', page: '/' }) } });
}
