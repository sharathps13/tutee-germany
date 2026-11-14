/**
 * Tutee Connect — website leads → Google Sheets + email.
 *
 * Paste this into its own standalone Apps Script project (script.google.com),
 * linked to the "Website Leads" spreadsheet with setSheetId(). Setup steps
 * are in apps-script/README.md next to this file.
 *
 * The landing page never calls this script directly. The form posts to the
 * site's own /api/enquiry function, which forwards the lead here with a token,
 * so the web-app URL and token stay out of the browser.
 *
 * Tokens: each country site can have its own token, saved in Script Properties
 * as LEADS_TOKEN_<COUNTRY> (e.g. LEADS_TOKEN_NEW_ZEALAND, LEADS_TOKEN_POLAND,
 * LEADS_TOKEN_UK, LEADS_TOKEN_IRELAND, LEADS_TOKEN_SINGAPORE, LEADS_TOKEN_UAE,
 * LEADS_TOKEN_FRANCE, LEADS_TOKEN_USA, LEADS_TOKEN_CANADA, LEADS_TOKEN_GERMANY).
 * Once a country has its own token, only that token is accepted for that
 * country's leads, and it cannot be used to write into another country's tab.
 * A country without its own token (Finland today) keeps using the shared
 * LEADS_TOKEN, exactly as before — except the countries in OWN_TOKEN_ONLY (the
 * UAE, France, the USA, Canada and Germany), which only ever accept their own
 * token.
 *
 * Each lead becomes one row in its country's tab ("Finland Leads", "UAE Leads",
 * "France Leads", "USA Leads", "Canada Leads", "Germany Leads", …), created and
 * formatted on first use, with the same columns as the sheet: Date, Time, Full
 * Name, Phone Number, Email, State, Shortlisted Universities, Course, Lead
 * Source, Preferred Call Time. When the student writes a message (the France
 * form's "Anything we should know?", the USA page's eligibility-check answers,
 * the Canada page's pathway / intake-plan choices, or the Germany page's
 * eligibility-check answers), it is attached as a note on their Full Name cell,
 * so the columns never change.
 * Every lead is also emailed, neatly formatted, to business@tuteeconnect.com
 * with Reply-To set to the student.
 */

var MAIL_TO = 'business@tuteeconnect.com';
var TIME_ZONE = 'Asia/Kolkata';
var DEFAULT_TAB = 'Finland Leads';
var HEADERS = ['Date', 'Time', 'Full Name', 'Phone Number', 'Email', 'State',
  'Shortlisted Universities', 'Course', 'Lead Source', 'Preferred Call Time'];
var WIDTHS = [100, 90, 180, 150, 230, 150, 320, 240, 260, 190];
var HEADER_BG = '#0b3d3a';

/** Every country site that sends leads here. */
var COUNTRIES = ['Finland', 'New Zealand', 'Poland', 'UK', 'Ireland', 'Singapore', 'UAE', 'France', 'USA', 'Canada', 'Germany'];

/** Countries that must use their own token: the shared LEADS_TOKEN is never accepted for them. */
var OWN_TOKEN_ONLY = ['UAE', 'France', 'USA', 'Canada', 'Germany'];

/** Run once from the editor: creates and formats the Finland Leads tab. */
function setupFinlandLeads() {
  var sheet = getLeadsSheet_(DEFAULT_TAB);
  try { getSpreadsheet_().setActiveSheet(sheet); } catch (e) { /* standalone project */ }
  return 'Ready: ' + sheet.getName();
}

/** Run once from the editor: creates and formats the UAE Leads tab (it would
 *  also be created by itself with the first UAE lead). */
function setupUAELeads() {
  var sheet = getLeadsSheet_('UAE Leads');
  try { getSpreadsheet_().setActiveSheet(sheet); } catch (e) { /* standalone project */ }
  return 'Ready: ' + sheet.getName();
}

/** Run once from the editor: creates and formats the France Leads tab (it
 *  would also be created by itself with the first France lead). */
function setupFranceLeads() {
  var sheet = getLeadsSheet_('France Leads');
  try { getSpreadsheet_().setActiveSheet(sheet); } catch (e) { /* standalone project */ }
  return 'Ready: ' + sheet.getName();
}

/** Run once from the editor: creates and formats the USA Leads tab (it would
 *  also be created by itself with the first USA lead). */
function setupUSALeads() {
  var sheet = getLeadsSheet_('USA Leads');
  try { getSpreadsheet_().setActiveSheet(sheet); } catch (e) { /* standalone project */ }
  return 'Ready: ' + sheet.getName();
}

/** Run once from the editor: creates and formats the Canada Leads tab (it
 *  would also be created by itself with the first Canada lead). */
function setupCanadaLeads() {
  var sheet = getLeadsSheet_('Canada Leads');
  try { getSpreadsheet_().setActiveSheet(sheet); } catch (e) { /* standalone project */ }
  return 'Ready: ' + sheet.getName();
}

/** Run once from the editor: creates and formats the Germany Leads tab (it
 *  would also be created by itself with the first Germany lead). */
function setupGermanyLeads() {
  var sheet = getLeadsSheet_('Germany Leads');
  try { getSpreadsheet_().setActiveSheet(sheet); } catch (e) { /* standalone project */ }
  return 'Ready: ' + sheet.getName();
}

/** Run once from the editor to store the shared token (paste your own value). */
function setToken() {
  var token = 'PASTE-A-LONG-RANDOM-TOKEN-HERE';
  if (/PASTE/.test(token)) throw new Error('Replace the placeholder with your own token first.');
  PropertiesService.getScriptProperties().setProperty('LEADS_TOKEN', token);
  return 'Token saved.';
}

/** Saves a country's own token after checking it is long enough and not
 *  already used by the shared token or any other country. */
function saveCountryToken_(country, token) {
  if (/PASTE/.test(token)) throw new Error('Replace the placeholder with your own token first.');
  var props = PropertiesService.getScriptProperties();
  if (token === props.getProperty('LEADS_TOKEN')) throw new Error('Use a different token from the shared LEADS_TOKEN.');
  COUNTRIES.forEach(function (c) {
    if (c !== country && token === props.getProperty(tokenKey_(c))) throw new Error('Use a different token from the ' + c + ' token.');
  });
  props.setProperty(tokenKey_(country), token);
  return 'Saved as ' + tokenKey_(country) + '.';
}

/** Run once from the editor to give the New Zealand site its own token. Paste a
 *  new long random value (30+ letters and numbers), run this, then delete the
 *  value from the code again. The same value goes in the New Zealand site's
 *  APPS_SCRIPT_TOKEN on Netlify. */
function setNewZealandToken() {
  return saveCountryToken_('New Zealand', 'PASTE-A-NEW-LONG-RANDOM-TOKEN-HERE');
}

/** Same as above, for the Poland site. */
function setPolandToken() {
  return saveCountryToken_('Poland', 'PASTE-A-NEW-LONG-RANDOM-TOKEN-HERE');
}

/** Same as above, for the UK site. */
function setUKToken() {
  return saveCountryToken_('UK', 'PASTE-A-NEW-LONG-RANDOM-TOKEN-HERE');
}

/** Same as above, for the Ireland site. */
function setIrelandToken() {
  return saveCountryToken_('Ireland', 'PASTE-A-NEW-LONG-RANDOM-TOKEN-HERE');
}

/** Same as above, for the Singapore site. */
function setSingaporeToken() {
  return saveCountryToken_('Singapore', 'PASTE-A-NEW-LONG-RANDOM-TOKEN-HERE');
}

/** Same as above, for the UAE site. UAE leads then land in the "UAE Leads" tab. */
function setUAEToken() {
  return saveCountryToken_('UAE', 'PASTE-A-NEW-LONG-RANDOM-TOKEN-HERE');
}

/** Run once from the editor to give the France site its own token. Paste a
 *  new long random value (30+ letters and numbers), run this, then delete the
 *  value from the code again. The same value goes in the France site's
 *  APPS_SCRIPT_TOKEN on Netlify. France leads then land in "France Leads".
 *  France never accepts the shared token, so leads are refused until this
 *  has been run. */
function setFranceToken() {
  return saveCountryToken_('France', 'PASTE-A-NEW-LONG-RANDOM-TOKEN-HERE');
}

/** Run once from the editor to give the USA site its own token. Paste a new
 *  long random value (30+ letters and numbers), run this, then delete the value
 *  from the code again. The same value goes in the USA site's
 *  APPS_SCRIPT_TOKEN on Netlify (with APPS_SCRIPT_URL = this Web app's /exec
 *  URL). USA leads then land in "USA Leads". The USA never accepts the shared
 *  token, so its leads are refused until this has been run. */
function setUSAToken() {
  return saveCountryToken_('USA', 'PASTE-A-NEW-LONG-RANDOM-TOKEN-HERE');
}

/** Run once from the editor to give the Canada site its own token. Paste a
 *  new long random value (30+ letters and numbers), run this, then delete the
 *  value from the code again. The same value goes in the Canada site's
 *  APPS_SCRIPT_TOKEN on Netlify (with APPS_SCRIPT_URL = this Web app's /exec
 *  URL). Canada leads then land in "Canada Leads". Canada never accepts the
 *  shared token, so its leads are refused until this has been run. */
function setCanadaToken() {
  return saveCountryToken_('Canada', 'PASTE-A-NEW-LONG-RANDOM-TOKEN-HERE');
}

/** Run once from the editor to give the Germany site its own token. Paste a
 *  new long random value (30+ letters and numbers), run this, then delete the
 *  value from the code again. The same value goes in the Germany site's
 *  APPS_SCRIPT_TOKEN on Netlify (with APPS_SCRIPT_URL = this Web app's /exec
 *  URL). Germany leads then land in "Germany Leads". Germany never accepts the
 *  shared token, so its leads are refused until this has been run. */
function setGermanyToken() {
  return saveCountryToken_('Germany', 'PASTE-A-NEW-LONG-RANDOM-TOKEN-HERE');
}

/** Run from the editor after changing tokens: shows which countries have their
 *  own token and which use the shared one (values are never printed). */
function checkTokens() {
  var props = PropertiesService.getScriptProperties();
  var out = ['Shared LEADS_TOKEN: ' + (props.getProperty('LEADS_TOKEN') ? 'set' : 'MISSING')];
  COUNTRIES.forEach(function (c) {
    var own = props.getProperty(tokenKey_(c));
    out.push(c + ': ' + (own ? 'own token (' + tokenKey_(c) + ')'
      : (OWN_TOKEN_ONLY.indexOf(c) !== -1 ? 'MISSING own token — leads refused until set' + c.replace(/\s+/g, '') + 'Token() is run'
        : 'uses the shared LEADS_TOKEN')));
  });
  console.log(out.join(' | '));
  return out.join(' | ');
}

/** "New Zealand" → "LEADS_TOKEN_NEW_ZEALAND". */
function tokenKey_(country) {
  return 'LEADS_TOKEN_' + String(country || '').toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

/** The token a lead for this country must carry: the country's own token if it
 *  has one, otherwise the shared LEADS_TOKEN. */
function expectedToken_(country) {
  var props = PropertiesService.getScriptProperties();
  var own = country && props.getProperty(tokenKey_(country));
  if (own) return own;
  // these countries never fall back to the shared token: without their own token, their leads are refused
  if (OWN_TOKEN_ONLY.indexOf(country) !== -1) return null;
  return props.getProperty('LEADS_TOKEN');
}

/** Web-app entry point: the site's /api/enquiry function POSTs JSON here. */
function doPost(e) {
  var body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return reply_(false, 'Bad JSON'); }

  var lead = normalise_(body);
  var token = expectedToken_(lead.country);
  if (!token || body.token !== token) return reply_(false, 'Unauthorised');

  if (!lead.name || !lead.email) return reply_(false, 'Missing name or email');

  var now = new Date();
  var row = [
    Utilities.formatDate(now, TIME_ZONE, 'dd/MM/yyyy'),
    Utilities.formatDate(now, TIME_ZONE, 'hh:mm a'),
    lead.name, lead.phone, lead.email, lead.state, lead.shortlist,
    lead.course, lead.source, lead.callTime
  ].map(safeCell_);

  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = getLeadsSheet_(lead.tab);
    sheet.appendRow(row);
    if (lead.message) sheet.getRange(sheet.getLastRow(), 3).setNote('Message from ' + lead.name + ':\n' + lead.message);
  } finally {
    lock.releaseLock();
  }

  var mailed = true, mailError = '';
  try { sendLeadEmail_(lead, row); } catch (err) { mailed = false; mailError = String(err); console.error('mail failed: ' + err); }
  return reply_(true, 'Saved', { mailed: mailed, mail_error: mailError });
}

/** Run from the editor to check email on its own: sends a sample lead to
 *  business@tuteeconnect.com. Any problem (permission, quota) shows in the
 *  Execution log straight away. */
function testEmail() {
  var lead = normalise_({ name: 'Test Lead', phone: '+91 9876543210', email: MAIL_TO, state: 'Tamil Nadu',
    course: "Master's – Data Science (Next intake)", lead_source: 'Finland Landing Page – test from the editor', call_time: 'Anytime' });
  var now = new Date();
  var row = [Utilities.formatDate(now, TIME_ZONE, 'dd/MM/yyyy'), Utilities.formatDate(now, TIME_ZONE, 'hh:mm a'),
    lead.name, lead.phone, lead.email, lead.state, lead.shortlist, lead.course, lead.source, lead.callTime];
  sendLeadEmail_(lead, row);
  return 'Sent. Emails left today: ' + MailApp.getRemainingDailyQuota();
}

/** Run from the editor to try the UAE path end to end without the website:
 *  writes one sample row to the UAE Leads tab and emails it. Delete the row
 *  afterwards. */
function testUAELead() {
  return testCountryLead_({ country: 'UAE', name: 'Test Lead (UAE)', phone: '+91 9876543210', email: MAIL_TO,
    state: 'Tamil Nadu', shortlist: 'Heriot-Watt University Dubai', course: 'MBA',
    lead_source: 'UAE Landing Page – test from the editor', call_time: 'Evening (3 – 6 pm IST)' });
}

/** Run from the editor to try the France path end to end without the website:
 *  writes one sample row (with a message note) to the France Leads tab and
 *  emails it. Delete the row afterwards. */
function testFranceLead() {
  return testCountryLead_({ country: 'France', name: 'Test Lead (France)', phone: '+91 9876543210', email: MAIL_TO,
    state: 'Karnataka', shortlist: 'PSL University, HEC Paris', course: "Master's degree",
    lead_source: 'France Landing Page – test from the editor', call_time: 'Evening (4 – 8 pm)',
    destination: 'France (flying from Bengaluru)', message: 'Test message: 8.4 CGPA, interested in data science.' });
}

/** Run from the editor to try the USA path end to end without the website:
 *  writes one sample row (with the eligibility-check answers as a note) to the
 *  USA Leads tab and emails it. Delete the row afterwards. The values match
 *  what the USA page sends (its course, call-time and state lists). */
function testUSALead() {
  return testCountryLead_({ country: 'USA', name: 'Test Lead (USA)', phone: '+91 9876543210', email: MAIL_TO,
    state: 'Tamil Nadu', shortlist: 'Massachusetts Institute of Technology (MIT), Stanford University',
    course: 'MS in Data Science / AI', lead_source: 'USA Landing Page – test from the editor',
    call_time: 'Evening (3 – 6 PM)', destination: 'USA – Massachusetts Institute of Technology (MIT), Stanford University',
    message: "Study level: Master's · Field of interest: Data Science / AI · Planned intake: Fall 2027" });
}

/** Run from the editor to try the Canada path end to end without the website:
 *  writes one sample row (with the pathway choice as a note) to the Canada
 *  Leads tab and emails it. Delete the row afterwards. The values match what
 *  the Canada page sends (its state, course and call-time lists). */
function testCanadaLead() {
  return testCountryLead_({ country: 'Canada', name: 'Test Lead (Canada)', phone: '+91 9876543210', email: MAIL_TO,
    state: 'Tamil Nadu', shortlist: 'University of Toronto', course: 'Data Science & AI',
    lead_source: 'Canada Landing Page – test from the editor', call_time: 'Evening (4 pm – 8 pm)',
    destination: "Canada pathway — Data Science · Master's · Ontario",
    message: "Interested in: Canada pathway — Data Science · Master's · Ontario · Intake: September 2027" });
}

/** Run from the editor to try the Germany path end to end without the website:
 *  writes one sample row (with the eligibility-check answers as a note) to the
 *  Germany Leads tab and emails it. Delete the row afterwards. The values match
 *  what the Germany page's form offers (its state, course, call-time and
 *  university lists). */
function testGermanyLead() {
  return testCountryLead_({ country: 'Germany', name: 'Test Lead (Germany)', phone: '+91 9876543210', email: MAIL_TO,
    state: 'Tamil Nadu', shortlist: 'Technical University of Munich', course: "Master's degree",
    lead_source: 'Germany Landing Page – test from the editor', call_time: 'Evening (4–8)',
    destination: 'Germany – Technical University of Munich',
    message: "Eligibility check: Completed 3-year degree · Language test: IELTS / TOEFL · Wants to study: Master's" });
}

function testCountryLead_(sample) {
  var lead = normalise_(sample);
  var now = new Date();
  var row = [Utilities.formatDate(now, TIME_ZONE, 'dd/MM/yyyy'), Utilities.formatDate(now, TIME_ZONE, 'hh:mm a'),
    lead.name, lead.phone, lead.email, lead.state, lead.shortlist, lead.course, lead.source, lead.callTime].map(safeCell_);
  var sheet = getLeadsSheet_(lead.tab);
  sheet.appendRow(row);
  if (lead.message) sheet.getRange(sheet.getLastRow(), 3).setNote('Message from ' + lead.name + ':\n' + lead.message);
  sendLeadEmail_(lead, row);
  return 'Added a test row to ' + lead.tab + ' and emailed it.';
}

/** Health check, so the setup can be tested from a browser. */
function doGet() {
  return reply_(true, 'Tutee Connect leads endpoint is running.');
}

/* ------------------------------------------------------------- helpers */

function normalise_(b) {
  var s = function (v, n) { return String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n || 300); };
  var country = s(b.country, 40);
  return {
    tab: country ? country + ' Leads' : DEFAULT_TAB,
    country: country,
    name: s(b.name, 120),
    phone: s(b.phone, 40),
    email: s(b.email, 200),
    state: s(b.state, 80) || '—',
    shortlist: s(b.shortlist, 1500) || '—',
    course: s(b.course, 300) || '—',
    source: s(b.lead_source, 300) || 'Website',
    callTime: s(b.call_time, 80) || 'Not specified',
    interest: s(b.destination, 600),
    message: s(b.message, 1500),
    page: s(b.page, 200)
  };
}

/** Text that starts with = + - @ would be read as a formula (a "+91 …" phone
 *  number included), so it is stored as plain text. */
function safeCell_(v) {
  var t = String(v == null ? '' : v);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

/** The leads tab, created and formatted on first use. */
function getLeadsSheet_(name) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (sheet) return sheet;

  sheet = ss.insertSheet(name);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    .setBackground(HEADER_BG).setFontColor('#ffffff').setFontWeight('bold')
    .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 32);
  sheet.setFrozenRows(1);
  WIDTHS.forEach(function (w, i) { sheet.setColumnWidth(i + 1, w); });
  sheet.getRange(2, 1, sheet.getMaxRows() - 1, HEADERS.length).setNumberFormat('@').setVerticalAlignment('top').setWrap(true);
  sheet.getRange(1, 1, sheet.getMaxRows(), HEADERS.length).createFilter();
  var extra = sheet.getMaxColumns() - HEADERS.length;
  if (extra > 0) sheet.deleteColumns(HEADERS.length + 1, extra);
  return sheet;
}

function sendLeadEmail_(lead, row) {
  var rows = HEADERS.map(function (h, i) { return [h, String(row[i]).replace(/^'/, '')]; });
  if (lead.interest) rows.push(['Interested In', lead.interest]);
  if (lead.message) rows.push(['Message', lead.message]);
  if (lead.page) rows.push(['Submitted From', lead.page]);

  var cells = rows.map(function (r, i) {
    return '<tr>' +
      '<td style="padding:10px 14px;border-bottom:1px solid #e6ece9;background:' + (i % 2 ? '#ffffff' : '#f6f9f8') + ';font-weight:600;color:#0b3d3a;white-space:nowrap;vertical-align:top;width:190px">' + esc_(r[0]) + '</td>' +
      '<td style="padding:10px 14px;border-bottom:1px solid #e6ece9;background:' + (i % 2 ? '#ffffff' : '#f6f9f8') + ';color:#1f2937;vertical-align:top">' + esc_(r[1]) + '</td>' +
      '</tr>';
  }).join('');

  var title = (lead.country || 'Finland') + ' Landing Page';
  var html =
    '<div style="font-family:Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;color:#1f2937">' +
      '<div style="background:' + HEADER_BG + ';color:#ffffff;padding:18px 22px;border-radius:12px 12px 0 0">' +
        '<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.8">New lead · ' + esc_(title) + '</div>' +
        '<div style="font-size:20px;font-weight:700;margin-top:4px">' + esc_(lead.name) + '</div>' +
      '</div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:14px;border:1px solid #e6ece9;border-top:0">' + cells + '</table>' +
      '<p style="font-size:12px;color:#6b7280;margin:14px 2px">Reply to this email to answer ' + esc_(lead.name) + ' directly. ' +
        'This lead is also saved in the "' + esc_(lead.tab) + '" tab of Website Leads.</p>' +
    '</div>';

  var text = ['New lead · ' + title, ''].concat(rows.map(function (r) { return r[0] + ': ' + r[1]; })).join('\n');

  MailApp.sendEmail({
    to: MAIL_TO,
    replyTo: lead.email,
    name: 'Tutee Connect Website',
    subject: 'New ' + (lead.country || 'Finland') + ' Lead – ' + lead.name,
    htmlBody: html,
    body: text
  });
}

function esc_(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function reply_(ok, message, extra) {
  var out = { success: ok, message: message };
  if (extra) Object.keys(extra).forEach(function (k) { out[k] = extra[k]; });
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

/** The Website Leads spreadsheet. A standalone project (script.google.com)
 *  opens it by the ID saved in SHEET_ID; a project made from the sheet's
 *  own Extensions menu uses that sheet directly. */
function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

/** Run once in a standalone project: paste the Website Leads ID (the long
 *  part of its URL between /d/ and /edit). */
function setSheetId() {
  var id = 'PASTE-THE-SPREADSHEET-ID-HERE';
  if (/PASTE/.test(id)) throw new Error('Replace the placeholder with the Website Leads spreadsheet ID first.');
  SpreadsheetApp.openById(id);
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', id);
  return 'Sheet linked.';
}

/** Diagnostic: shows which token settings exist (never the values) for any
 *  country — e.g. run debugGermanyToken() after setGermanyToken(). */
function debugToken_(country) {
  var props = PropertiesService.getScriptProperties().getProperties();
  var keys = Object.keys(props).sort();
  var out = [
    'Script ID: ' + ScriptApp.getScriptId(),
    'Saved settings: ' + keys.map(function (k) { return k + (/TOKEN/.test(k) ? ' (' + props[k].length + ' chars)' : ''); }).join(', '),
    country + ' key looked up: ' + tokenKey_(country),
    country + ' token found: ' + (props[tokenKey_(country)] ? 'yes' : 'NO')
  ];
  console.log(out.join('\n'));
  return out.join('\n');
}
function debugUSAToken() { return debugToken_('USA'); }
function debugCanadaToken() { return debugToken_('Canada'); }
function debugGermanyToken() { return debugToken_('Germany'); }
