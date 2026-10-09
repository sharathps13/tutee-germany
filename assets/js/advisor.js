/* Tutee Advisor — a route of six topic "stops" + a conversation desk.
   There is NO live AI: answers are prepared and checked by the Tutee team (edit TOPICS below).
   Each answer is tagged: g = general guidance (safe to state) · c = needs a counsellor's review for specifics.
   Keep answers free of figures that change (blocked-account sum, Blue Card salary) unless re-verified. */
(function () {
  'use strict';
  var TOPICS = [
    { k: 'Applying', city: 'Aachen', qa: [
      ['What are the basic requirements to study in Germany?', 'g', 'You need a school or university qualification that German universities recognise for your chosen degree level, proof of language skills for the language the programme is taught in, and the programme\'s own requirements — for a master\'s, usually a related bachelor\'s degree. Indian applicants also need an APS certificate. Requirements are set per programme, so the exact list always comes from the university.'],
      ['Can I apply to multiple universities at the same time?', 'g', 'Yes. Applying to several programmes in one intake is normal and usually sensible. Each application is assessed separately; where uni-assist is used there is a fee per application, so we help you build a balanced shortlist of ambitious, target and safe choices.'],
      ['Do I need IELTS or another English-language test?', 'g', 'For English-taught programmes, most universities ask for IELTS, TOEFL or a similar test; a few accept other proof, such as English-medium previous study. German-taught programmes ask for German instead — typically TestDaF, DSH or a Goethe certificate. Minimum scores differ by programme.'],
      ['What is APS, and do I need it?', 'g', 'APS (Akademische Prüfstelle) checks that your Indian academic documents are genuine before you apply for a German student visa. If you studied in India, you will normally need the APS certificate for your visa and for many university applications. Processing takes time, so start it early.'],
      ['When should I start my applications?', 'c', 'Ideally 9 to 12 months before your intended start. Winter-semester deadlines often fall between spring and mid-summer, summer-semester deadlines towards the end of the previous year — but each university sets its own dates, and APS and language tests need to be done first. We map the deadlines for your shortlist.']
    ] },
    { k: 'Visa', city: 'Berlin', qa: [
      ['What documents do I need for a German student visa?', 'g', 'Typically a valid passport, your admission letter, proof of finances (usually a blocked account), health insurance, academic certificates and — for Indian applicants — the APS certificate. The German mission\'s current checklist is the final word, so we check your file against it before your appointment.'],
      ['How does the blocked account work?', 'c', 'A blocked account (Sperrkonto) holds the amount Germany sets for one year of student living costs. After arrival you can withdraw a fixed monthly sum. The required amount is reviewed periodically, so we confirm the current figure before you transfer any money.'],
      ['When should I start my visa application?', 'g', 'As soon as you have your admission letter. Book the appointment early and prepare your blocked account, insurance and documents in parallel — appointment availability can be tight in peak season.'],
      ['What happens if my visa appointment is delayed?', 'c', 'Tell your university early. Many can confirm a later arrival date, and some allow a deferral to the next semester. Keep proof of your booking. We help you plan these conversations before they become urgent.']
    ] },
    { k: 'Funding', city: 'Frankfurt', qa: [
      ['How much money should I budget for Germany?', 'c', 'Plan for three parts: the semester contribution at public universities (an administrative fee — most states charge no tuition), monthly living costs, which the blocked-account amount is based on, and one-time costs such as flights, visa, insurance and a rent deposit. Rent varies a lot by city, so we build a budget for your shortlist.'],
      ['Are scholarships available for international students?', 'g', 'Yes — DAAD programmes, the Deutschlandstipendium awarded by universities, and scholarships from foundations and individual universities. They are competitive and have fixed deadlines, so it helps to plan them alongside your applications.'],
      ['Can I work part-time while studying?', 'g', 'Yes, within yearly limits on full and half working days for non-EU students; student-assistant jobs at the university can follow different rules. Part-time income helps with living costs, but it cannot replace the funds you must prove for your visa.'],
      ['What other financial support options can I explore?', 'c', 'Education loans from banks and specialist lenders are the most common — we work with partner lenders and can compare offers. Savings, family support and choosing a more affordable city also make a real difference to the total.']
    ] },
    { k: 'After graduation', city: 'Hamburg', qa: [
      ['What options do I have after completing my degree?', 'g', 'Most graduates either apply for a residence permit to look for a qualified job, move straight into a job with an EU Blue Card or skilled-worker permit, or continue to a PhD. The right route depends on your degree, your job market and your plans.'],
      ['How long can I stay in Germany to look for a job?', 'g', 'Graduates of German universities can usually get a residence permit of up to 18 months to look for a job that matches their qualification, and may work in any job meanwhile to support themselves.'],
      ['Can I switch from a student residence permit to a work permit?', 'g', 'Yes. With a qualifying job offer you can change your residence title inside Germany — for example to an EU Blue Card or a skilled-worker permit — without leaving the country.'],
      ['What should I do after receiving a full-time job offer?', 'c', 'Check which permit your offer qualifies for, then apply at your local foreigners\' authority (Ausländerbehörde) with your contract and documents. Processing times vary by city. We help you confirm the right permit and prepare the file.']
    ] },
    { k: 'Life in Germany', city: 'Heidelberg', qa: [
      ['Which German cities are suitable for international students?', 'g', 'Berlin, Munich, Hamburg, Frankfurt, Cologne, Aachen and Stuttgart are popular, as are university towns such as Heidelberg, Freiburg and Göttingen. The best fit depends on your programme, budget and the industries you want to work in.'],
      ['How much does student accommodation cost?', 'c', 'It varies widely: a room in a student hall (Studierendenwerk) is usually the cheapest option, while a shared flat or private studio in Munich, Frankfurt or Hamburg costs considerably more than in smaller towns. Halls have waiting lists, so apply as soon as you are admitted.'],
      ['What is everyday student life like in Germany?', 'g', 'Independent and well organised: a semester ticket for local transport at many universities, subsidised canteens (Mensa), student clubs and sports, and a strong culture of self-study. Most offices still rely on appointments and paperwork, so a little planning goes a long way.'],
      ['Do I need to learn German to live and work there?', 'g', 'For an English-taught degree you can study without it, but German makes everyday life, part-time work and your job search much easier — and it matters for long-term residence. We recommend starting early, even alongside an English-taught course.']
    ] },
    { k: 'PR & long-term options', city: 'Munich', qa: [
      ['How can I move from studying to long-term residence?', 'g', 'A common sequence is: student residence permit → job-seeker permit after graduation → EU Blue Card or skilled-worker permit → settlement permit (Niederlassungserlaubnis). Each step has its own conditions, so treat this as a typical route, not a guarantee.'],
      ['How does the EU Blue Card work?', 'c', 'It is a residence permit for people with a recognised degree in a qualified job that meets a minimum salary. The threshold is set each year and is lower for shortage occupations and recent graduates. Because the figures change, we check the current threshold for your offer.'],
      ['What are the current requirements for permanent residence?', 'c', 'They depend on your permit and include a minimum period of qualified employment, pension contributions, secure income and housing, and German language skills. German university graduates and Blue Card holders can have shorter routes. The rules are updated from time to time, so we check your timeline against the current law.'],
      ['Does learning German affect my long-term residence options?', 'g', 'Yes. Better German can shorten the path to a settlement permit — for example on the Blue Card route — and it is required for citizenship. It also widens the jobs open to you.']
    ] }
  ];
  var T = function (k) { return TOPICS.filter(function (t) { return t.k === k; })[0]; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var root = $('#advisor'); if (!root) return;
  var route = $('#tav-route'), link = $('#tav-link'), thread = $('#tav-thread'), follow = $('#tav-follow'), form = $('#tav-form'), input = $('#tav-in'), desk = $('.tav__desk', root);
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, cur = TOPICS[0], asked = {}, tok = 0;
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  /* ---------- route: six stops, the active one opens its questions ---------- */
  TOPICS.forEach(function (t, i) {
    var li = document.createElement('li'); li.className = 'tav__stop'; li.dataset.k = t.k;
    li.innerHTML = '<button type="button" class="tav__stopbtn" aria-expanded="false"><i class="tav__dot" aria-hidden="true"></i><span class="mono">' + String(i + 1).padStart(2, '0') + ' · ' + t.city.toUpperCase() + '</span><b>' + t.k + '</b></button>' +
      '<div class="tav__qs"><ul>' + t.qa.map(function (q, j) { return '<li style="--d:' + (j * .05) + 's"><button type="button" data-j="' + j + '"><span>' + esc(q[0]) + '</span><i aria-hidden="true">→</i></button></li>'; }).join('') + '</ul></div>';
    route.appendChild(li);
  });
  function openStop(t) {
    cur = t;
    route.querySelectorAll('.tav__stop').forEach(function (li) { var on = li.dataset.k === t.k; li.classList.toggle('on', on); li.querySelector('.tav__stopbtn').setAttribute('aria-expanded', on); });
    setTimeout(drawLink, reduce ? 0 : 420);
  }
  // the fine route line from the active stop to the advisor desk
  function drawLink() {
    if (innerWidth <= 980) return;
    var li = route.querySelector('.tav__stop.on .tav__stopbtn b'); if (!li) return;
    var u = root.getBoundingClientRect(), d = li.getBoundingClientRect(), k = desk.getBoundingClientRect(), x = d.right + 14;
    link.style.top = (d.top - u.top + d.height * .55) + 'px'; link.style.left = (x - u.left) + 'px'; link.style.width = Math.max(0, k.left - x - 4) + 'px';
    link.classList.remove('go'); void link.offsetWidth; link.classList.add('go');
  }
  addEventListener('resize', function () { clearTimeout(drawLink.t); drawLink.t = setTimeout(drawLink, 150); });
  route.addEventListener('click', function (e) {
    var sb = e.target.closest('.tav__stopbtn'); if (sb) { openStop(T(sb.parentNode.dataset.k)); return; }
    var qb = e.target.closest('.tav__qs button'); if (!qb) return;
    var t = T(qb.closest('.tav__stop').dataset.k), q = t.qa[+qb.dataset.j];
    route.querySelectorAll('.tav__qs button').forEach(function (b) { b.classList.toggle('on', b === qb); });
    ask(q[0], q, t, qb);
    if (innerWidth <= 980) setTimeout(function () { desk.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }, 200);
  });

  /* ---------- conversation ---------- */
  function scrollDown() { thread.scrollTo({ top: thread.scrollHeight, behavior: reduce ? 'auto' : 'smooth' }); }
  function ask(text, qa, topic, from) {
    var my = ++tok; follow.innerHTML = '';
    var me = document.createElement('div'); me.className = 'tav__me'; me.innerHTML = '<span class="mono">You · ' + esc(topic ? topic.k : 'Your question') + '</span><p>' + esc(text) + '</p>';
    // the chosen question travels from the route into the desk (a light FLIP, transform only)
    thread.appendChild(me);
    if (from && !reduce && innerWidth > 980) {
      var a = from.getBoundingClientRect(), b = me.getBoundingClientRect();
      me.animate([{ transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px)', opacity: .35 }, { transform: 'none', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
    }
    var ad = document.createElement('div'); ad.className = 'tav__ad';
    ad.innerHTML = '<i class="tav__logo sm" aria-hidden="true"></i><div class="tav__body"><span class="tav__tag mono">Tutee Advisor</span><span class="tav__typing"><i></i><i></i><i></i><em>Preparing your answer…</em></span></div>';
    thread.appendChild(ad); scrollDown(); root.classList.add('responding');
    if (qa) asked[qa[0]] = 1;
    setTimeout(function () {
      if (my !== tok) { ad.remove(); return; }
      var body = $('.tav__body', ad), kind = qa ? qa[1] : 'c';
      var label = !qa ? 'Needs a counsellor' : kind === 'g' ? 'Verified guidance' : 'Verified guidance · details vary';
      var sent = qa ? qa[2].split(/(?<=[.!?])\s+/) : ['Good question — and the honest answer depends on your profile.', 'A Tutee counsellor will look at your background and reply personally, usually within one working day.'];
      body.innerHTML = '<span class="tav__tag mono">Tutee Advisor <b class="' + (qa ? (kind === 'g' ? 'ok' : 'mid') : 'cn') + '">' + label + '</b></span><p class="tav__a">' +
        sent.map(function (s, i) { return '<span style="--d:' + (reduce ? 0 : i * .14) + 's">' + esc(s) + ' </span>'; }).join('') + '</p>' +
        (qa && kind === 'g' ? '' : '<p class="tav__cn">' + (qa ? 'Amounts, dates and thresholds change — a counsellor confirms the current figures for you.' : 'Leave your details and we\'ll answer this one personally.') + ' <a class="tlink" href="#begin">Ask a counsellor →</a></p>');
      root.classList.remove('responding'); scrollDown(); offerFollowUps(topic);
    }, reduce ? 0 : 680);
  }
  function offerFollowUps(topic) {
    var t = topic || cur, left = t.qa.filter(function (q) { return !asked[q[0]]; }).slice(0, 3);
    if (!left.length) { var nx = TOPICS[(TOPICS.indexOf(t) + 1) % TOPICS.length]; follow.innerHTML = '<span class="mono">Next stop</span><button type="button" data-next="' + esc(nx.k) + '">' + esc(nx.k) + ' →</button>'; return; }
    follow.innerHTML = '<span class="mono">Ask next</span>' + left.map(function (q, i) { return '<button type="button" data-k="' + esc(t.k) + '" data-q="' + esc(q[0]) + '" style="--d:' + (i * .06) + 's">' + esc(q[0]) + '</button>'; }).join('');
  }
  follow.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.next) { openStop(T(b.dataset.next)); return; }
    var t = T(b.dataset.k), q = t.qa.filter(function (x) { return x[0] === b.dataset.q; })[0];
    route.querySelectorAll('.tav__qs button').forEach(function (x) { x.classList.toggle('on', x.textContent.indexOf(q[0]) === 0); });
    ask(q[0], q, t);
  });

  /* ---------- own questions: matched to the closest prepared answer, or handed to a counsellor ---------- */
  var STOP = /\b(the|a|an|i|my|me|can|do|does|is|are|to|in|of|for|and|or|what|how|when|which|will|it|be|with|on|after|germany|german|study|studying|there|much|need)\b/g;
  var KEYS = { visa: 'Visa', blocked: 'Visa', sperrkonto: 'Visa', embassy: 'Visa', vfs: 'Visa', appointment: 'Visa', aps: 'Applying', ielts: 'Applying', toefl: 'Applying', english: 'Applying', uni: 'Applying', assist: 'Applying', apply: 'Applying', admission: 'Applying', deadline: 'Applying', scholarship: 'Funding', scholarships: 'Funding', loan: 'Funding', budget: 'Funding', cost: 'Funding', costs: 'Funding', money: 'Funding', fees: 'Funding', tuition: 'Funding', job: 'After graduation', graduation: 'After graduation', graduate: 'After graduation', offer: 'After graduation', blue: 'PR & long-term options', card: 'PR & long-term options', permanent: 'PR & long-term options', settlement: 'PR & long-term options', residence: 'PR & long-term options', citizenship: 'PR & long-term options', city: 'Life in Germany', cities: 'Life in Germany', rent: 'Life in Germany', accommodation: 'Life in Germany', housing: 'Life in Germany', language: 'Life in Germany', life: 'Life in Germany' };
  function words(s) { return s.toLowerCase().replace(/[^a-zäöüß\s]/g, ' ').replace(STOP, ' ').split(/\s+/).filter(function (w) { return w.length > 2; }); }
  var hit = function (arr, x) { return arr.some(function (h) { return h.indexOf(x) === 0 || x.indexOf(h) === 0; }); };
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var q = input.value.trim(); if (q.length < 3) { input.focus(); return; }
    q = q.charAt(0).toUpperCase() + q.slice(1);
    var w = words(q), best = null, score = 0;
    TOPICS.forEach(function (t) { t.qa.forEach(function (qa) { var hq = words(qa[0]), ha = words(qa[2]), s = 0; w.forEach(function (x) { if (hit(hq, x)) s += 1.5; else if (hit(ha, x)) s += .6; if (KEYS[x] === t.k) s += 1; }); if (s > score) { score = s; best = [qa, t]; } }); });
    input.value = '';
    if (best && score >= 2.4) { openStop(best[1]); ask(q, best[0], best[1]); }
    else ask(q, null, null);
  });

  $('#tav-restart').addEventListener('click', function () { tok++; asked = {}; follow.innerHTML = ''; root.classList.remove('responding'); route.querySelectorAll('.tav__qs button').forEach(function (b) { b.classList.remove('on'); }); welcome(); });
  function welcome() {
    thread.innerHTML = '<div class="tav__ad tav__hi"><i class="tav__logo sm" aria-hidden="true"></i><div class="tav__body"><span class="tav__tag mono">Tutee Advisor</span><p class="tav__a"><span>Hallo! Choose a stop on the route — from applying to settling — and pick a question. Or type your own below.</span></p></div></div>';
    offerFollowUps(cur);
  }
  openStop(TOPICS[0]); welcome();
  new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { drawLink(); o.disconnect(); } }).observe(root);
})();
