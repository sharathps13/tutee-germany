// /api/enquiry — receives the landing page's lead form and forwards it to the Tutee Connect Apps Script
// (Google Sheet "Germany Leads" + email to business@tuteeconnect.com). The Apps Script URL and the Germany token live
// only in Netlify environment variables, never in the browser:
//   APPS_SCRIPT_URL    the Apps Script Web app URL (ends in /exec)
//   APPS_SCRIPT_TOKEN  the same value saved by setGermanyToken() in the Apps Script
const COUNTRY = 'Germany';
const LEAD_SOURCE = 'Germany Landing Page';
const MAX_BODY = 20000;

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const clean = (v, n = 300) => String(v == null ? '' : v).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

export default async (req) => {
  if (req.method !== 'POST') return json(405, { success: false, message: 'Use POST' });
  const url = process.env.APPS_SCRIPT_URL, token = process.env.APPS_SCRIPT_TOKEN;
  if (!url || !token) return json(503, { success: false, message: 'Lead sheet is not configured' });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(413, { success: false, message: 'Too large' });
  let b; try { b = JSON.parse(raw || '{}'); } catch { return json(400, { success: false, message: 'Bad JSON' }); }

  // honeypot: bots fill the hidden checkbox. Answer "ok" so they move on, but save nothing.
  if (b.botcheck) return json(200, { success: true, message: 'Saved' });

  const name = clean(b.name, 120), email = clean(b.email, 200);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { success: false, message: 'Missing name or email' });

  const lead = {
    token, country: COUNTRY,
    name, email, phone: clean(b.phone, 40), state: clean(b.state, 80),
    shortlist: clean(b.shortlist || b.university, 1500), course: clean(b.course, 300),
    lead_source: clean(b.form ? `${LEAD_SOURCE} – ${b.form}` : LEAD_SOURCE, 300),
    call_time: clean(b.call_time, 80), destination: clean(b.destination, 600),
    message: clean(b.message || b.notes, 1500), page: clean(b.page, 200),
  };

  try {
    // Apps Script answers with a redirect to script.googleusercontent.com; fetch follows it
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead), redirect: 'follow' });
    const out = await r.json().catch(() => ({}));
    if (!out.success) return json(502, { success: false, message: out.message || 'Lead sheet refused the enquiry' });
    return json(200, { success: true, message: 'Saved', mailed: out.mailed !== false });
  } catch (e) {
    return json(502, { success: false, message: 'Lead sheet unreachable' });
  }
};

export const config = { path: '/api/enquiry' };
