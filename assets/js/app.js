/* Tutee Connect — Study in Germany. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf = function (fn) { var q = false; return function () { if (!q) { q = true; requestAnimationFrame(function () { q = false; fn(); }); } }; };

  /* ---------------- content (facts carried over from the existing Germany pages;
     immigration figures change often and must be verified each intake) ---------------- */
  var SERVICES = [
    ['Career consultation', 'A free session on your profile and the careers Germany\'s industries open up.', ['Free 1:1 session', 'Profile evaluation', 'Course direction']],
    ['Language tests', 'IELTS or TOEFL for English-taught courses, plus guidance on German (TestDaF, DSH, Goethe) where needed.', ['IELTS · TOEFL · PTE', 'TestDaF · DSH · Goethe', 'Prep plan']],
    ['University selection', 'A shortlist of public universities and Fachhochschulen matched to your grades, goals and budget.', ['Ambitious, target, safe', 'TU9 & Excellence', 'Applied sciences']],
    ['APS, uni-assist and documents', 'APS certificate, uni-assist or direct applications, and every transcript and statement checked before filing.', ['APS certificate', 'uni-assist', 'Motivation letter & CV']],
    ['Student visa', 'National (D) visa file, embassy or VFS appointment, blocked account and health insurance, handled.', ['National (D) visa', 'Blocked account', 'Health insurance']],
    ['End-to-end settlement', 'Housing search, Anmeldung (city registration) and pre-departure briefings.', ['Housing', 'Anmeldung', 'Pre-departure briefing']],
    ['Financial aid', 'DAAD and Deutschlandstipendium scholarships, plus education loans through our partners.', ['DAAD', 'Deutschlandstipendium', 'Education loans']],
    ['Post-landing support', 'Residence permit at the Ausländerbehörde, bank account and finding permitted part-time work.', ['Residence permit', 'Bank account', 'Part-time work']],
    ['Family migration', 'Planning the EU Blue Card or skilled-worker route so your family can join you.', ['EU Blue Card', 'Skilled-worker permit', 'Family reunion']]
  ];
  var SVC_CTA = ['Book career guidance', 'Plan my language test', 'Find my right course', 'Get document guidance', 'Get visa guidance', 'Plan my departure', 'Check loan eligibility', 'Plan my first weeks', 'Get family visa help'];
  var CITIES = [
    { code: 'MUC', name: 'Munich', de: 'München', region: 'Bavaria', ll: '48.14°N · 11.58°E', x: 242.4, y: 223.8, unis: [['Technical University of Munich', 'Excellence'], ['LMU Munich', 'Excellence'], ['Munich University of Applied Sciences', 'Applied Sciences']] },
    { code: 'BER', name: 'Berlin', de: 'Berlin', region: 'Berlin', ll: '52.52°N · 13.40°E', x: 297, y: 92.4, unis: [['Freie Universität Berlin', 'Public'], ['Humboldt-Universität zu Berlin', 'Public'], ['Technische Universität Berlin', 'TU9'], ['Berlin University of Applied Sciences and Technology', 'Applied Sciences']] },
    { code: 'HDB', name: 'Heidelberg', de: 'Heidelberg', region: 'Baden-Württemberg', ll: '49.40°N · 8.67°E', x: 155.1, y: 186, unis: [['Heidelberg University', 'Excellence']] },
    { code: 'AAH', name: 'Aachen', de: 'Aachen', region: 'North Rhine-Westphalia', ll: '50.78°N · 6.08°E', x: 77.4, y: 144.6, unis: [['RWTH Aachen University', 'TU9']] },
    { code: 'KAE', name: 'Karlsruhe', de: 'Karlsruhe', region: 'Baden-Württemberg', ll: '49.01°N · 8.40°E', x: 147, y: 197.7, unis: [['Karlsruhe Institute of Technology', 'Excellence']] },
    { code: 'HAM', name: 'Hamburg', de: 'Hamburg', region: 'Hamburg', ll: '53.55°N · 9.99°E', x: 194.7, y: 61.5, unis: [['University of Hamburg', 'Public']] },
    { code: 'DRS', name: 'Dresden', de: 'Dresden', region: 'Saxony', ll: '51.05°N · 13.74°E', x: 307.2, y: 136.5, unis: [['TU Dresden', 'TU9']] }
  ];
  var UNIS = [
    ['Technical University of Munich', 'Munich, Bavaria', 'ex'], ['LMU Munich', 'Munich, Bavaria', 'ex'],
    ['Heidelberg University', 'Heidelberg, Baden-Württemberg', 'ex'], ['RWTH Aachen University', 'Aachen, North Rhine-Westphalia', 'tu9'],
    ['Karlsruhe Institute of Technology', 'Karlsruhe, Baden-Württemberg', 'ex'], ['Freie Universität Berlin', 'Berlin', 'pub'],
    ['Humboldt-Universität zu Berlin', 'Berlin', 'pub'], ['Technische Universität Berlin', 'Berlin', 'tu9'],
    ['University of Hamburg', 'Hamburg', 'pub'], ['TU Dresden', 'Dresden, Saxony', 'tu9'],
    ['Munich University of Applied Sciences', 'Munich, Bavaria', 'fh'], ['Berlin University of Applied Sciences and Technology', 'Berlin', 'fh']
  ];
  var BADGE = { ex: ['Excellence', 'b-ex'], tu9: ['TU9', 'b-tu9'], pub: ['Public', 'b-pub'], fh: ['Applied Sciences', 'b-fh'] };
  /* VERIFY before launch: confirm each quote is a real client who consented. */
  var STORIES = [
    ['My son has received his German student visa for a master\'s at one of Germany\'s reputed universities. Despite his complicated profile, the team made this happen.', 'Ramana S.', 'Parent of student'],
    ['Tutee Connect got my APS certificate, blocked account and every supporting document exactly right, and my visa was approved on the very first attempt!', 'Priya K.', 'Master\'s student, TUM'],
    ['They didn\'t just help with the admission. Their help finding a room and getting my Anmeldung done in the first week was a lifesaver.', 'Vishal M.', 'Mechanical Engineering, RWTH Aachen'],
    ['I had a previous visa refusal and was losing hope. My coordinator completely turned it around and guided me through the entire documentation process.', 'Sneha R.', 'Graduate student, TU Berlin'],
    ['The education loan assistance is genuine. They connected me with their banking partners and got my blocked account funded quickly.', 'Rahul V.', 'Computer Science, KIT'],
    ['Their consultation on the 18-month job-seeker permit and the Blue Card pathway gave me the exact clarity I needed before flying out.', 'Anita D.', 'MBA candidate, Berlin']
  ];
  var FAQ = [
    ['What are the basic requirements to study in Germany?', 'Generally, you need a valid passport, a school-leaving certificate or degree recognised as equivalent (otherwise a year at a Studienkolleg may be needed), proof of language skills (IELTS or TOEFL for English-taught courses; TestDaF, DSH or Goethe certificates for German-taught ones), a motivation letter and CV. Applicants from India also need an APS certificate before the visa application. Many master\'s programs are taught in English; most bachelor\'s programs are in German.'],
    ['How does the German student visa process work?', 'Once you hold an admission letter, you apply for a national (D) visa at the German mission or its VFS centre. You\'ll need proof of finances, usually a blocked account (Sperrkonto) holding about €11,904 for one year, plus health insurance, your APS certificate and academic documents. Book your appointment early, as waiting times can be long. After arrival you register your address (Anmeldung) and convert the visa into a residence permit at the local Ausländerbehörde.'],
    ['Is studying in Germany really free?', 'Public universities charge no tuition in most states, only a semester contribution of roughly €150–€400 that often includes a public-transport ticket. Baden-Württemberg charges non-EU students €1,500 per semester, and private universities set their own fees. Living costs are the main expense, which is why the blocked account exists.'],
    ['Can I get financial aid or an education loan?', 'Yes. We help with DAAD scholarships and the Deutschlandstipendium, and through our tie-ups with banks and financial institutions we arrange collateral and non-collateral loans that can fund your blocked account, fees and living expenses.'],
    ['Can my family relocate with me to Germany?', 'It\'s possible in limited cases while you study, but you must prove enough money and living space for everyone, which is hard on a student budget. The family route becomes much easier once you hold an EU Blue Card or skilled-worker permit: spouses of Blue Card holders don\'t need to show German skills and may work.'],
    ['How long can I stay and work after graduation?', 'Graduates can get an 18-month residence permit to look for a job matching their qualification, and may work in any job while searching. The usual next step is an EU Blue Card (a minimum gross salary set each year, lower for shortage occupations and recent graduates) or a skilled-worker residence permit. Permanent settlement can follow after as little as 21 months on a Blue Card with B1 German, or two years for graduates of German universities.']
  ];
  var LOANS = ['hdfc-credila', 'icici', 'axis', 'avanse', 'auxilo', 'idfc', 'incred', 'union', 'mpower', 'prodigy'];
  var LOAN_NAMES = { 'hdfc-credila': 'HDFC Credila', icici: 'ICICI Bank', axis: 'Axis Bank', avanse: 'Avanse', auxilo: 'Auxilo', idfc: 'IDFC FIRST Bank', incred: 'InCred', union: 'Union Bank of India', mpower: 'MPOWER Financing', prodigy: 'Prodigy Finance' };

  /* ---------------- hero entrance ---------------- */
  requestAnimationFrame(function () { $('#hero').classList.add('in'); });

  /* ---------------- header / floating pill / mobile bar ---------------- */
  var hdr = $('#hdr'), pill = $('#pill'), wa = $('#wa'), mbar = $('#mbar'), lastY = 0, formOn = false;
  var onScroll = raf(function () {
    var y = scrollY, past = y > $('#hero').offsetHeight * .75;
    hdr.classList.toggle('solid', y > 40);
    if (y > 500 && y > lastY + 4) hdr.classList.add('hide'); else if (y < lastY - 4) hdr.classList.remove('hide');
    [pill, mbar].forEach(function (el) { el.classList.toggle('on', past && !formOn); });
    wa.classList.toggle('on', past);
    lastY = y;
  });
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  new IntersectionObserver(function (e) { formOn = e[0].isIntersecting; onScroll(); }, { threshold: .15 }).observe($('#begin'));

  /* ---------------- word-split headings + reveals ---------------- */
  $$('.split').forEach(function (el) {
    var html = '';
    el.childNodes.forEach(function (n) {
      if (n.nodeType === 3) html += n.textContent.split(/(\s+)/).map(function (w) { return !w || /^\s+$/.test(w) ? w : '<span class="w"><span>' + w + '</span></span>'; }).join('');
      else html += '<span class="w"><span>' + n.outerHTML + '</span></span>';
    });
    el.innerHTML = html;
    $$('.w>span', el).forEach(function (s, i) { s.style.transitionDelay = i * .04 + 's'; });
  });
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .14, rootMargin: '0px 0px -6% 0px' });
  $$('.rv,.split,.reveal-img').forEach(function (el) { io.observe(el); });

  /* ---------------- count-up ---------------- */
  var cio = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting || reduce) return; cio.unobserve(e.target);
      var el = e.target, end = +el.dataset.count, t0 = performance.now();
      (function t(n) { var p = Math.min(1, (n - t0) / 1500); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(t); })(t0);
    });
  }, { threshold: .6 });
  $$('[data-count]').forEach(function (el) { cio.observe(el); });

  /* ---------------- magnetic CTAs (desktop) ---------------- */
  if (fine && !reduce) $$('.mag').forEach(function (b) {
    b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .16 + 'px,' + (e.clientY - r.top - r.height / 2) * .26 + 'px)'; });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  });

  /* ---------------- parallax ---------------- */
  var pxEls = $$('[data-px]');
  if (pxEls.length && !reduce) {
    var px = raf(function () { pxEls.forEach(function (el) { var r = el.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - innerHeight / 2) * -(+el.dataset.px)) + 'px,0)'; }); });
    addEventListener('scroll', px, { passive: true }); px();
  }

  /* ---------------- hero chips → prefill study level ---------------- */
  function prefillLevel(v) { if (v) { var s = $('#f-level'); $$('option', s).some(function (o) { if (o.value === v || o.text === v) { s.value = o.value; return true; } }); } }
  $$('.chip').forEach(function (c) {
    c.addEventListener('click', function () {
      $$('.chip').forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
      prefillLevel(c.dataset.level);
      setTimeout(function () { $('#begin').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }, 220);
    });
  });
  $$('a[data-level]').forEach(function (a) { a.addEventListener('click', function () { prefillLevel(a.dataset.level); }); });

  var NS = 'http://www.w3.org/2000/svg';
  var DEST = [
    { id: 'de', code: 'DE', name: 'Germany', ll: '51.2°N 10.4°E', x: 721.6, y: 99.2, tag: 'World-class engineering — often with little or no tuition at public universities.', facts: ['No tuition at most public universities — a semester contribution only', 'TUM, LMU, Heidelberg and the TU9 technical universities', 'Hundreds of English-taught master\'s programs', '18 months after graduation to find your role'], home: true },
    { id: 'uk', code: 'UK', name: 'United Kingdom', ll: '51.5°N 0.1°W', x: 679.5, y: 98, tag: 'Historic universities, shorter degrees, global recognition.', facts: ['One-year master\'s programmes', 'Graduate-route options to work after study', 'Centuries of academic reputation'] },
    { id: 'us', code: 'US', name: 'USA', ll: '40.7°N 74.0°W', x: 384, y: 141.2, tag: 'The widest choice of universities and programmes on earth.', facts: ['Flexible, research-led degrees in every field', 'A strong STEM ecosystem', 'Scholarships and assistantships at many universities'] },
    { id: 'ca', code: 'CA', name: 'Canada', ll: '43.7°N 79.4°W', x: 362.4, y: 129.2, tag: 'Welcoming, multicultural and built around pathways from study to career.', facts: ['Colleges and universities with strong industry links', 'Post-graduation work options for eligible graduates', 'Well-defined routes toward permanent residence'] },
    { id: 'au', code: 'AU', name: 'Australia', ll: '33.9°S 151.2°E', x: 1284.8, y: 439.6, tag: 'Top-ranked universities and an outdoor lifestyle.', facts: ['Several universities among the world\'s best', 'Post-study work options', 'Skilled-migration programmes'] },
    { id: 'nz', code: 'NZ', name: 'New Zealand', ll: '36.8°S 174.8°E', x: 1379.2, y: 451.2, tag: 'Practical, high-quality education in a remarkably safe country.', facts: ['All eight universities internationally ranked', 'Post-study work options', 'Applied, hands-on learning'] },
    { id: 'ie', code: 'IE', name: 'Ireland', ll: '53.3°N 6.3°W', x: 655, y: 90.6, tag: 'Europe\'s English-speaking tech and pharma hub.', facts: ['European HQs of major technology companies', 'Stay-back options for eligible graduates', 'Friendly and English-speaking'] },
    { id: 'fr', code: 'FR', name: 'France', ll: '48.9°N 2.4°E', x: 689.4, y: 108.6, tag: 'Grandes écoles, business schools and culture at every corner.', facts: ['Globally ranked business and engineering schools', 'A growing range of English-taught programmes', 'Access to the Schengen area'] },
    { id: 'fi', code: 'FI', name: 'Finland', ll: '60.2°N 24.9°E', x: 779.8, y: 63.3, tag: 'Innovative education in one of the world\'s happiest countries.', facts: ['A renowned, student-centred education system', 'Scholarships at many universities', 'High quality of life'] },
    { id: 'pl', code: 'PL', name: 'Poland', ll: '52.2°N 21.0°E', x: 764, y: 95.1, tag: 'Affordable EU education in a fast-growing economy.', facts: ['Lower tuition and living costs', 'Popular for medicine, engineering and IT', 'An EU base for your career'] },
    { id: 'sg', code: 'SG', name: 'Singapore', ll: '1.4°N 103.8°E', x: 1095.2, y: 298.6, tag: 'Asia\'s business capital, a short flight from home.', facts: ['Globally ranked universities', 'A gateway to careers across Asia', 'Safe, efficient and close to India'] },
    { id: 'my', code: 'MY', name: 'Malaysia', ll: '3.1°N 101.7°E', x: 1086.8, y: 291.4, tag: 'Quality education at a fraction of the cost.', facts: ['Branch campuses of UK and Australian universities', 'Affordable tuition and living costs', 'Multicultural and welcoming'] },
    { id: 'ae', code: 'AE', name: 'UAE', ll: '25.2°N 55.3°E', x: 901.1, y: 203.2, tag: 'Study and build a career where our second office is.', facts: ['International branch campuses in Dubai', 'A thriving job market', 'Local support from our Dubai team'] },
    { id: 'mu', code: 'MU', name: 'Mauritius', ll: '20.2°S 57.5°E', x: 910, y: 384.8, tag: 'An island campus with international degrees.', facts: ['Affordable international programmes', 'English and French widely spoken', 'A safe, peaceful study environment'] }
  ];
  var UNIV = [
    { s: 'TUM', name: 'Technical University of Munich', city: 'Munich', state: 'Bavaria', ll: '48.14°N · 11.58°E', x: 242.4, y: 223.8, b: 'Excellence', areas: ['Engineering', 'Computer Science', 'Natural Sciences', 'Management'] },
    { s: 'LMU', name: 'LMU Munich', city: 'Munich', state: 'Bavaria', ll: '48.15°N · 11.58°E', x: 242.4, y: 223.8, b: 'Excellence', areas: ['Humanities', 'Medicine', 'Business', 'Natural Sciences'] },
    { s: 'HEI', name: 'Heidelberg University', city: 'Heidelberg', state: 'Baden-Württemberg', ll: '49.40°N · 8.67°E', x: 155.1, y: 186, b: 'Excellence', areas: ['Medicine', 'Life Sciences', 'Physics', 'Humanities'] },
    { s: 'RWTH', name: 'RWTH Aachen University', city: 'Aachen', state: 'North Rhine-Westphalia', ll: '50.78°N · 6.08°E', x: 77.4, y: 144.6, b: 'TU9', areas: ['Mechanical Engineering', 'Electrical Engineering', 'Computer Science', 'Architecture'] },
    { s: 'KIT', name: 'Karlsruhe Institute of Technology', city: 'Karlsruhe', state: 'Baden-Württemberg', ll: '49.01°N · 8.40°E', x: 147, y: 197.7, b: 'Excellence', areas: ['Engineering', 'Physics', 'Computer Science', 'Energy'] },
    { s: 'FU', name: 'Freie Universität Berlin', city: 'Berlin', state: 'Berlin', ll: '52.45°N · 13.29°E', x: 297, y: 92.4, b: 'Public', areas: ['Social Sciences', 'Humanities', 'Natural Sciences', 'Economics'] },
    { s: 'TUB', name: 'Technische Universität Berlin', city: 'Berlin', state: 'Berlin', ll: '52.51°N · 13.33°E', x: 297, y: 92.4, b: 'TU9', areas: ['Engineering', 'Computer Science', 'Urban Planning', 'Management'] },
    { s: 'UHH', name: 'University of Hamburg', city: 'Hamburg', state: 'Hamburg', ll: '53.57°N · 9.98°E', x: 194.7, y: 61.5, b: 'Public', areas: ['Law', 'Economics', 'Natural Sciences', 'Climate Research'] },
    { s: 'TUD', name: 'TU Dresden', city: 'Dresden', state: 'Saxony', ll: '51.03°N · 13.73°E', x: 307.2, y: 136.5, b: 'TU9', areas: ['Engineering', 'Microelectronics', 'Life Sciences', 'Computer Science'] }
  ];

  /* ---------------- 01 hero: globe, depth layers, scroll-out ---------------- */
  (function () {
    var hero = $('#hero'), g = null;
    function boot() {
      if (!window.TCGlobe) return;
      var markers = DEST.map(function (d) { var m = d.x / 4 - 170, l = 76 - d.y / 4; return { id: d.id, lon: m, lat: l, label: d.id === 'de' ? 'GERMANY' : '' }; });
      g = new TCGlobe($('#globe'), { markers: markers, hubs: [{ lat: 13.08, lon: 80.27, label: 'Chennai' }, { lat: 25.2, lon: 55.27, label: 'Dubai' }], lon: 40, lat: 22, spin: 0.035, arcEvery: 1100, maxArcs: 6, interactive: false });
      g.active = 'de';
    }
    if (document.readyState === 'complete') boot(); else addEventListener('load', boot);
    var layers = $$('[data-depth]', hero), mx = 0, my = 0;
    if (fine && !reduce) hero.addEventListener('pointermove', function (e) {
      mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5;
      if (g) { g.steer.x = mx; g.steer.y = my; }
      layers.forEach(function (l) { var d = +l.dataset.depth; l.style.transform = 'translate3d(' + (-mx * 40 * d) + 'px,' + (-my * 30 * d) + 'px,0)'; });
    });
    hero.addEventListener('pointerleave', function () { if (g) { g.steer.x = 0; g.steer.y = 0; } });
    // hover a destination on the globe → postcard preview
    var IMG = { de: '1641531339739-1d4f309980e1', uk: '1486299267070-83823f5448dd', us: '1499092346589-b9b6be3e94b2', ca: '1507992781348-310259076fe0', au: '1506973035872-a4ec16b8e8d9', nz: '1595125990323-885cec5217ff', ie: '1549918864-48ac978761a4', fr: '1502602898657-3e91760cbb34', fi: '1538332576228-eb5b4c4de6f5', pl: '1607427293702-036933bbf746', sg: '1525625293386-3f8f99389edd', my: '1566914447826-bf04e54bf1be', ae: '1512453979798-5ea266f8880c', mu: '1513415277900-a62401e19be4' };
    var peek = $('#h4-peek'), canvas = $('#globe'), hov = null;
    if (fine) canvas.addEventListener('pointermove', function (e) {
      if (!g) return; var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, best = null, bd = 22;
      g.markers.forEach(function (m) { var p = g.project(m.v); if (p[2] <= .1) return; var d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = { m: m, p: p }; } });
      if (best) {
        var d = DEST.filter(function (k) { return k.id === best.m.id; })[0];
        if (hov !== d.id) { hov = d.id; $('#peek-img').style.backgroundImage = 'url(https://images.unsplash.com/photo-' + IMG[d.id] + '?auto=format&fit=crop&w=360&h=220&q=75)'; $('#peek-code').textContent = d.code + ' · ' + d.ll; $('#peek-name').textContent = d.name; $('#peek-ll').textContent = d.tag; g.active = d.id; g.arcTo(d.id); }
        peek.style.transform = 'translate(' + (best.p[0] + 18) + 'px,' + (best.p[1] - 20) + 'px)'; peek.classList.add('on'); canvas.style.cursor = 'pointer';
      } else if (hov) { hov = null; peek.classList.remove('on'); canvas.style.cursor = ''; g.active = 'de'; }
    });
    canvas.addEventListener('pointerleave', function () { hov = null; peek.classList.remove('on'); if (g) g.active = 'de'; });
    canvas.addEventListener('click', function () { if (hov) { var b = $$('.wpin')[DEST.findIndex(function (k) { return k.id === hov; })]; $('#explore').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); if (b) setTimeout(function () { b.dispatchEvent(new Event('click')); }, 700); } });
    var flown = false;
    // scroll: the globe rises and grows as you "take off" into the map
    var gl = $('#h4-globe'), cp = $('.h4__copy');
    var sc = raf(function () {
      if (reduce) return; var p = Math.min(1, scrollY / hero.offsetHeight);
      gl.style.scale = (1 + p * .9).toFixed(3); gl.style.translate = (-p * 22) + '% ' + (-p * 10) + '%'; gl.style.opacity = (1 - p * .85).toFixed(3);
      if (g) { if (p > .08 && !flown) { flown = true; g.focus(51, 10.4, 'de'); g.spin = 0; } else if (p < .02 && flown) { flown = false; g.spin = 0.035; g.focusing = false; } }
      $$('.tag4', hero).forEach(function (t, k) { t.style.translate = '0 ' + (-p * (60 + k * 40)) + 'px'; t.style.opacity = 1 - p * 1.6; });
      cp.style.translate = '0 ' + (-p * 120) + 'px'; cp.style.opacity = (1 - p * 1.2).toFixed(3);
    });
    addEventListener('scroll', sc, { passive: true });
  })();

  /* ---------------- 02 world map ---------------- */
  (function () {
    var pins = $('#wm-pins'), rail = $('#wm-rail'), route = $('#wm-route'), plane = $('#wm-plane'), ims = $$('.wm__im'), cur = -1, O = { x: 1001.1, y: 251.7 }, anim;
    DEST.forEach(function (d, i) {
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'wpin'); g.setAttribute('transform', 'translate(' + d.x + ' ' + d.y + ')');
      g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', d.name);
      var dx = d.x > 1150 ? -12 : 12, anchor = d.x > 1150 ? 'end' : 'start';
      g.innerHTML = '<circle class="hit" r="16"/><circle class="p" r="9"/><circle class="c" r="5"/><text x="' + dx + '" y="-10" text-anchor="' + anchor + '">' + d.name.toUpperCase() + '</text>';
      g.addEventListener('click', function () { pick(i); });
      if (fine) g.addEventListener('mouseenter', function () { pick(i); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i); } });
      pins.appendChild(g);
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', 'false');
      b.innerHTML = '<b>' + d.code + '</b>' + d.name; b.addEventListener('click', function () { pick(i); }); rail.appendChild(b);
    });
    function arcPath(d) { var mx = (O.x + d.x) / 2, my = Math.min(O.y, d.y) - Math.abs(O.x - d.x) * .28 - 20; return 'M' + O.x + ' ' + O.y + ' Q ' + mx + ' ' + my + ' ' + d.x + ' ' + d.y; }
    function pick(i) {
      if (i === cur) return; var first = cur < 0, prev = cur; cur = i; var d = DEST[i];
      $$('.wpin', pins).forEach(function (p, k) { p.classList.toggle('on', k === i); });
      $$('button', rail).forEach(function (b, k) { b.setAttribute('aria-selected', k === i); });
      var rb = rail.children[i]; if (rb && rail.offsetParent && !first) rail.scrollTo({ left: rb.offsetLeft - 20, behavior: reduce ? 'auto' : 'smooth' });
      // route draws from Chennai
      route.setAttribute('d', arcPath(d)); var L = route.getTotalLength(); route.style.transition = 'none'; route.style.strokeDasharray = L; route.style.strokeDashoffset = L;
      cancelAnimationFrame(anim); var t0 = performance.now(), D = reduce ? 1 : 1300;
      (function f(n) { var k = Math.min(1, (n - t0) / D), e = 1 - Math.pow(1 - k, 3); route.style.strokeDashoffset = L * (1 - e);
        var p = route.getPointAtLength(L * e), q = route.getPointAtLength(Math.min(L, L * e + 1)), a = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI + 90;
        if (k >= 1) { var p0 = route.getPointAtLength(L - 1); a = Math.atan2(p.y - p0.y, p.x - p0.x) * 180 / Math.PI + 90; }
        plane.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + a + ')'); if (k < 1) anim = requestAnimationFrame(f); })(t0);
      // image: circular reveal from the pin's relative position
      var cx = (d.x / 1400 * 100).toFixed(0) + '%', cy = (d.y / 496 * 100).toFixed(0) + '%';
      ims.forEach(function (im, k) { im.classList.remove('prev'); if (k === prev) im.classList.add('prev'); im.style.setProperty('--cx', cx); im.style.setProperty('--cy', cy); im.classList.toggle('on', k === i); });
      var info = $('.wm__info'); info.classList.add('wm__swap');
      var fill = function () {
        $('#wm-code').textContent = d.code + ' · ' + d.ll; $('#wm-name').textContent = d.name; $('#wm-tag').textContent = d.tag;
        $('#wm-facts').innerHTML = d.facts.map(function (f, k) { return '<li style="animation-delay:' + k * .08 + 's">' + f + '</li>'; }).join('');
        $('#wm-go-t').textContent = d.home ? 'Explore Germany' : 'Ask about ' + d.name;
        $('#wm-go').setAttribute('href', d.home ? '#choose' : '#begin'); $('#wm-go').dataset.dest = d.name;
        $('#wm-note').textContent = d.home ? 'Featured on this page' : 'We advise on all 14 destinations';
        info.classList.remove('out');
      };
      if (first || reduce) fill(); else { info.classList.add('out'); setTimeout(fill, 260); }
    }
    $('#wm-go').addEventListener('click', function () { var v = this.dataset.dest; if (v) $('#p-dest').value = v; });
    pick(0);
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { ims.forEach(function (d) { var im = d.querySelector('img'); if (im) im.loading = 'eager'; }); o.disconnect(); } }, { rootMargin: '600px' }).observe($('#explore'));
  })();

  /* ---------------- 04 why we do: scroll-driven journey stages ---------------- */
  var STAGES = [
    { k: 'Dream', t: 'It starts with a conversation, not a form.', why: 'Every plan begins with you — your profile, your budget, the career you picture. A free first session turns a vague dream into a direction.', svc: [0], cta: 'Book career guidance' },
    { k: 'Explore', t: 'See the whole map before you pick a road.', why: 'We compare countries, cities and routes honestly — including when Germany isn\'t your best fit — and plan your language tests early.', svc: [1], cta: 'Explore your options' },
    { k: 'Choose', t: 'The right university, not just a famous one.', why: 'A shortlist of public universities and Fachhochschulen matched to your grades, goals and budget — ambitious, target and safe.', svc: [2], cta: 'Find my right course' },
    { k: 'Prepare', t: 'Every document right, the first time.', why: 'APS, uni-assist, blocked account, scholarships, loans and your national (D) visa — checked the way a visa officer would check them.', svc: [3, 4, 6], cta: 'Get visa guidance' },
    { k: 'Go global', t: 'We don\'t disappear at the airport.', why: 'Housing, Anmeldung, residence permit, part-time work — and later, the Blue Card route that brings your family over.', svc: [5, 7, 8], cta: 'Start my journey' }
  ];
  (function () {
    var sec = $('#services'), pin = $('#w5-pin'), track = $('#w5-track'), bgs = $$('.w5__bg'), ims = $$('.w5__im'), word = $('#w5-word'), fillEl = $('#w5-fill'), plane = $('#w5-plane');
    var cur = -1, N = STAGES.length;
    STAGES.forEach(function (st, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'w5__stop'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', 'false');
      b.style.left = (1 + i * 98 / (N - 1)) + '%';
      b.innerHTML = '<i aria-hidden="true"></i><small>' + String(i + 1).padStart(2, '0') + '</small><span>' + st.k + '</span>';
      b.addEventListener('click', function () { go(i, true); });
      if (fine) b.addEventListener('mouseenter', function () { if (!sticky()) show(i); });
      track.appendChild(b);
    });
    var stops = $$('.w5__stop', track);
    function sticky() { return innerWidth > 900 && !reduce; }
    function show(i) {
      if (i === cur) return; var first = cur < 0, dir = i > cur ? 1 : -1; cur = i; var st = STAGES[i];
      stops.forEach(function (b, k) { b.setAttribute('aria-selected', k === i); b.classList.toggle('done', k < i); });
      var f = i / (N - 1); fillEl.style.transform = 'scaleX(' + f + ')'; plane.style.left = (1 + f * 98) + '%';
      bgs.forEach(function (b, k) { b.classList.toggle('on', k === i); });
      ims.forEach(function (m, k) { m.classList.remove('from-l', 'from-r'); if (k === i) { m.classList.add(dir > 0 ? 'from-r' : 'from-l'); void m.offsetWidth; } m.classList.toggle('on', k === i); });
      $('#w5-count').textContent = String(i + 1).padStart(2, '0') + ' / 05';
      var tx = $('#w5-text');
      var fill = function () {
        word.textContent = st.k; word.classList.remove('out');
        $('#w5-eyebrow').textContent = 'STAGE ' + String(i + 1).padStart(2, '0') + ' · ' + st.k.toUpperCase();
        $('#w5-title').textContent = st.t; $('#w5-why').textContent = st.why;
        $('#w5-svc').innerHTML = st.svc.map(function (s, k) { var v = SERVICES[s]; return '<li style="animation-delay:' + (k * .08) + 's"><b>' + v[0] + '</b><span>' + v[1] + '</span></li>'; }).join('');
        $('#w5-cta-t').textContent = st.cta; tx.classList.remove('out');
      };
      if (first || reduce) fill(); else { word.classList.add('out'); tx.classList.add('out'); setTimeout(fill, 260); }
    }
    // clicking a stop: on desktop scroll to that stage's slice of the pinned section; elsewhere just show it
    function go(i, smooth) {
      if (!sticky()) { show(i); return; }
      var top = sec.offsetTop + (sec.offsetHeight - innerHeight) * (i / (N - 1)) + 2;
      scrollTo({ top: top, behavior: smooth ? 'smooth' : 'auto' });
    }
    var onS = raf(function () {
      if (!sticky()) return;
      var r = sec.getBoundingClientRect(), span = sec.offsetHeight - innerHeight, p = Math.max(0, Math.min(1, -r.top / span));
      show(Math.min(N - 1, Math.round(p * (N - 1) + .001)));
      pin.style.setProperty('--p', p.toFixed(3));
      document.body.classList.toggle('in-why', r.top <= 1 && r.bottom >= innerHeight - 1);
    });
    addEventListener('scroll', onS, { passive: true }); addEventListener('resize', onS);
    track.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.min(N - 1, cur + 1), true); stops[cur + 1 < N ? cur + 1 : cur].focus(); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(0, cur - 1), true); } });
    var sx = null; pin.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    pin.addEventListener('touchend', function (e) { if (sx === null || sticky()) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(Math.max(0, Math.min(N - 1, cur + (dx < 0 ? 1 : -1)))); sx = null; });
    show(0); onS();
    new IntersectionObserver(function (e, o) { if (e[0].isIntersecting) { $$('img', sec).forEach(function (im) { im.loading = 'eager'; }); o.disconnect(); } }, { rootMargin: '800px' }).observe(sec);
  })();

  /* ---------------- 03 university discovery ---------------- */
  (function () {
    var bgs = $$('.ud__bg'), strip = $('#ud-strip'), pins = $('#ud-pins'), cur = -1, timer;
    UNIV.forEach(function (u, i) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', 'false');
      b.innerHTML = '<small>' + String(i + 1).padStart(2, '0') + ' · ' + u.city.toUpperCase() + '</small><span>' + u.s + '</span>';
      b.addEventListener('click', function () { show(i); }); strip.appendChild(b);
    });
    var seen = {};
    UNIV.forEach(function (u) { var k = u.x + ',' + u.y; if (seen[k]) return; seen[k] = 1;
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'pin'); g.dataset.k = k; g.setAttribute('transform', 'translate(' + u.x + ' ' + u.y + ')');
      g.innerHTML = '<circle class="p" r="8"/><circle class="c" r="4.5"/><text x="10" y="4">' + u.city.toUpperCase() + '</text>'; pins.appendChild(g); });
    function words(t) { return t.split(' ').map(function (w, k) { return '<span class="w"><span style="animation-delay:' + k * .07 + 's">' + w + '</span></span>'; }).join(' '); }
    function show(i) {
      i = (i + UNIV.length) % UNIV.length; if (i === cur) return; var first = cur < 0, back = !first && i < cur, prev = cur; cur = i; var u = UNIV[i], giant = $('#ud-giant');
      $$('button', strip).forEach(function (b, k) { b.setAttribute('aria-selected', k === i); });
      var sb = strip.children[i]; if (!first) strip.scrollTo({ left: sb.offsetLeft - strip.clientWidth / 2 + sb.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
      bgs.forEach(function (b, k) { b.classList.remove('prev', 'back'); if (k === prev) b.classList.add('prev'); if (k === i && back) { b.classList.add('back'); } });
      requestAnimationFrame(function () { bgs.forEach(function (b, k) { b.classList.toggle('on', k === i); }); });
      $$('.pin', pins).forEach(function (p) { p.classList.toggle('on', p.dataset.k === u.x + ',' + u.y); });
      var fill = function () {
        giant.textContent = u.s; giant.classList.remove('out');
        $('#ud-idx').textContent = String(i + 1).padStart(2, '0') + ' / ' + String(UNIV.length).padStart(2, '0'); $('#ud-ll').textContent = u.ll;
        $('#ud-name').innerHTML = words(u.name); $('#ud-city').textContent = u.city; $('#ud-state').textContent = u.state; $('#ud-badge').textContent = u.b;
        $('#ud-areas').innerHTML = u.areas.map(function (a, k) { return '<li style="animation-delay:' + (.25 + k * .07) + 's">' + a + '</li>'; }).join('');
      };
      if (first || reduce) fill(); else { giant.classList.add('out'); setTimeout(fill, 300); }
    }
    $('#ud-prev').addEventListener('click', function () { stop(); show(cur - 1); });
    $('#ud-next').addEventListener('click', function () { stop(); show(cur + 1); });
    strip.addEventListener('click', stop);
    var sec = $('#choose'), sx = null;
    sec.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    sec.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60) { stop(); show(cur + (dx < 0 ? 1 : -1)); } sx = null; });
    sec.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { stop(); show(cur + 1); } if (e.key === 'ArrowLeft') { stop(); show(cur - 1); } });
    function stop() { clearInterval(timer); timer = null; }
    show(0);
    new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { bgs.forEach(function (d) { var im = d.querySelector('img'); if (im) im.loading = 'eager'; }); if (!timer && !reduce && !sec.dataset.touched) timer = setInterval(function () { show(cur + 1); }, 6000); }
      else stop();
    }, { threshold: .35 }).observe(sec);
    sec.addEventListener('pointerdown', function () { sec.dataset.touched = 1; stop(); });
  })();

  /* ---------------- loan partner marquee ---------------- */
  var mq = $('#marq'), logos = LOANS.map(function (k) { return '<img src="assets/img/loan/' + k + '.webp" alt="' + LOAN_NAMES[k] + '" width="150" height="60" loading="lazy">'; }).join('');
  mq.innerHTML = logos + logos.replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"');

  /* ---------------- pathway progress ---------------- */
  var stepsWrap = $('#steps'), stepEls = $$('.step', stepsWrap);
  var runSteps = raf(function () {
    var r = stepsWrap.getBoundingClientRect(), p = Math.max(0, Math.min(1, (innerHeight * .65 - r.top) / r.height));
    stepsWrap.style.setProperty('--p', p.toFixed(3));
    stepEls.forEach(function (s, i) { s.classList.toggle('on', p > (i / stepEls.length) + .02 || (i === 0 && p > 0)); });
  });
  addEventListener('scroll', runSteps, { passive: true }); runSteps();

  /* ---------------- stories ---------------- */
  var qi = 0, qt, qcard = $('#qcard'), dots = $('#qdots');
  STORIES.forEach(function (s, i) {
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Story ' + (i + 1) + ': ' + s[1]); b.innerHTML = '<i></i>';
    b.addEventListener('click', function () { showQ(i); }); dots.appendChild(b);
  });
  function showQ(i, first) {
    qi = (i + STORIES.length) % STORIES.length; var s = STORIES[qi];
    var fill = function () { $('#q').textContent = s[0]; $('#q-n').textContent = s[1]; $('#q-m').textContent = s[2]; $('#q-av').textContent = s[1].charAt(0); qcard.classList.remove('out'); };
    if (first || reduce) fill(); else { qcard.classList.add('out'); setTimeout(fill, 320); }
    $$('button', dots).forEach(function (b, k) { b.removeAttribute('aria-current'); if (k === qi) { void b.offsetWidth; b.setAttribute('aria-current', 'true'); } });
    clearTimeout(qt); if (!reduce) qt = setTimeout(function () { showQ(qi + 1); }, 7000);
  }
  $('#q-prev').addEventListener('click', function () { showQ(qi - 1); });
  $('#q-next').addEventListener('click', function () { showQ(qi + 1); });
  showQ(0, true);

  /* ---------------- FAQ: smooth accordion, one open at a time ---------------- */
  var acc = $('#acc');
  FAQ.forEach(function (f, i) {
    acc.insertAdjacentHTML('beforeend', '<details' + (i === 0 ? ' open' : '') + '><summary><small>' + String(i + 1).padStart(2, '0') + '</small>' + f[0] + '<i aria-hidden="true"></i></summary><div class="ans"><p>' + f[1] + '</p></div></details>');
  });
  $$('details', acc).forEach(function (d) {
    var sum = d.querySelector('summary'), ans = d.querySelector('.ans');
    sum.addEventListener('click', function (e) {
      e.preventDefault();
      if (d.open) { close(d); } else {
        $$('details[open]', acc).forEach(close);
        d.open = true; if (reduce) return;
        var h = ans.scrollHeight; ans.style.height = '0px'; requestAnimationFrame(function () { ans.style.height = h + 'px'; });
        ans.addEventListener('transitionend', function t() { ans.style.height = ''; ans.removeEventListener('transitionend', t); });
      }
    });
  });
  function close(d) {
    var ans = d.querySelector('.ans'); if (reduce) { d.open = false; return; }
    ans.style.height = ans.scrollHeight + 'px'; requestAnimationFrame(function () { ans.style.height = '0px'; });
    ans.addEventListener('transitionend', function t() { d.open = false; ans.style.height = ''; ans.removeEventListener('transitionend', t); });
  }

  /* ---------------- 09 passport ---------------- */
  (function () {
    var scene = $('#pp-scene'), book = $('#book'), cover = $('#cover'), form = $('#pass'), go = $('#p-go'), st = $('#p-status');
    $('#pp-date').textContent = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    function open() { if (book.classList.contains('open')) return; book.classList.add('open'); cover.setAttribute('aria-label', 'Passport opened'); setTimeout(function () { if (innerWidth > 860) return; $('#p-name').focus({ preventScroll: true }); }, 1500); }
    cover.addEventListener('click', open);
    cover.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    new IntersectionObserver(function (e) { if (e[0].isIntersecting) { scene.classList.add('in'); setTimeout(open, reduce ? 0 : 1400); } }, { threshold: .55 }).observe(scene);
    $$('a[href="#begin"]').forEach(function (a) { a.addEventListener('click', function () { setTimeout(open, 700); }); });
    $('#p-name').addEventListener('input', function () { $('#pp-holder').textContent = (this.value.trim() || 'YOUR NAME').toUpperCase().slice(0, 24); });
    $('#p-from').addEventListener('change', function () { var cc = { India: '+91', UAE: '+971', 'Sri Lanka': '+94', Nepal: '+977', Bangladesh: '+880' }[this.value]; if (cc) $('#p-cc').value = cc; });
    function bad(id, c) { $(id).closest('.pf').classList.toggle('bad', c); return c; }
    ['#p-name', '#p-phone', '#p-email'].forEach(function (id) { $(id).addEventListener('input', function () { $(id).closest('.pf').classList.remove('bad'); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); st.className = 'pass__status'; st.textContent = '';
      var d = {}; new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
      var x = bad('#p-name', d.name.length < 2);
      x = bad('#p-phone', !/^\d{7,15}$/.test(d.phone_number.replace(/\D/g, ''))) || x;
      x = bad('#p-email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) || x;
      if (x) { var f = $('.pf.bad input', form); if (f) f.focus(); return; }
      var dest = d.destination_choice || 'Germany';
      var payload = { name: d.name, email: d.email, phone: d.country_code + ' ' + d.phone_number,
        destination: dest + ' | ' + d.study_level + ' | from ' + d.origin, study_level: d.study_level, origin: d.origin,
        from_name: 'Tutee Connect — Germany landing page', page: location.pathname + location.search, botcheck: d.botcheck };
      go.disabled = true; $('#p-go-t').textContent = 'Stamping your passport…';
      fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (res) {
          if (!res || !res.success) throw new Error((res && res.message) || '');
          $('#done-n').textContent = d.name.split(' ')[0]; book.classList.add('ok');
          if (window.dataLayer) dataLayer.push({ event: 'generate_lead', lead_country: dest, lead_level: d.study_level, lead_origin: d.origin });
          if (window.fbq) fbq('track', 'Lead');
        })
        .catch(function (err) { st.className = 'pass__status e'; st.textContent = err && err.message && err.message !== 'Failed to fetch' ? err.message : 'We couldn\'t send that just now. Please try again, or message us on WhatsApp.'; })
        .then(function () { go.disabled = false; $('#p-go-t').textContent = 'Get your free consultation'; });
    });
  })();

  /* ---------------- cursor + journey thread ---------------- */
  (function () {
    if (fine && !reduce) {
      var c = $('#cursor'), ct = $('#cursor-t'), x = 0, y = 0, tx = 0, ty = 0, r;
      addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; c.classList.add('on'); if (!r) r = requestAnimationFrame(function m() { x += (tx - x) * .22; y += (ty - y) * .22; c.style.transform = 'translate(' + x + 'px,' + y + 'px)'; r = Math.abs(tx - x) + Math.abs(ty - y) > .3 ? requestAnimationFrame(m) : null; }); }, { passive: true });
      document.addEventListener('pointerover', function (e) { var t = e.target.closest('.hcta') ? null : e.target.closest('[data-cursor],.wpin,.ud__strip button,.svc__btn,#cover'); c.classList.toggle('big', !!t); ct.textContent = t ? (t.dataset.cursor || (t.matches('.wpin') ? 'Fly' : t.matches('#cover') ? 'Open' : 'View')) : ''; });
      document.addEventListener('pointerleave', function () { c.classList.remove('on'); });
    }
    var svg = $('#thread'), base = $('#thread-base'), live = $('#thread-live'), plane = $('#thread-plane'), main = $('#top'), L = 0;
    function build() {
      if (innerWidth <= 1180) return;
      var H = main.scrollHeight, W = innerWidth, secs = $$('main > section, main > div.ticker'), pts = [], side = 0;
      svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.style.height = H + 'px';
      var gx = Math.max(24, (W - Math.min(W - 2 * 64, 1320)) / 2 - 34);
      var hx = Math.max(14, gx - 6);
      pts.push([hx, $('#hero').offsetHeight * .7]);
      secs.slice(1).forEach(function (s) { side = 1 - side; pts.push([side ? hx + 14 : hx - 6, s.offsetTop + 40]); pts.push([side ? hx + 14 : hx - 6, s.offsetTop + s.offsetHeight - 40]); });
      var d = 'M' + pts[0][0] + ' ' + pts[0][1];
      for (var k = 1; k < pts.length; k++) { var a = pts[k - 1], b = pts[k], my = (a[1] + b[1]) / 2; d += ' C ' + a[0] + ' ' + my + ' ' + b[0] + ' ' + my + ' ' + b[0] + ' ' + b[1]; }
      base.setAttribute('d', d); live.setAttribute('d', d); L = live.getTotalLength(); live.style.strokeDasharray = L; upd();
    }
    // the thread runs behind sections: draw it only in the gutters by clipping to section edges is overkill — it sits under content (z-index) and fades over text areas
    function upd() {
      if (!L) return; var target = scrollY + innerHeight * .6, lo = 0, hi = L;
      for (var it = 0; it < 18; it++) { var mid = (lo + hi) / 2; if (live.getPointAtLength(mid).y < target) lo = mid; else hi = mid; }
      live.style.strokeDashoffset = L - lo; var p = live.getPointAtLength(lo), q = live.getPointAtLength(Math.min(L, lo + 2));
      plane.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + (Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI + 90) + ')');
    }
    addEventListener('load', build); addEventListener('resize', raf(build)); addEventListener('scroll', raf(upd), { passive: true });
    setTimeout(build, 1500);
  })();

  /* ---------------- scroll-linked moments: ticker, €0 scale, expanding band, journey rail, hero depth ---------------- */
  (function () {
    var ticks = $$('[data-tick]'), zero = $('#zero'), band = $('#band'), rail = $('#jrail'), rl = $$('a', rail), stages = $$('[data-stage]'), hm = null;
    var order = ['hero', 'explore', 'choose', 'services', 'pathway', 'begin'];
    var run = raf(function () {
      var vh = innerHeight;
      if (!reduce) {
        ticks.forEach(function (t) { var r = t.parentElement.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return; t.style.transform = 'translate3d(' + ((r.top - vh) * 0.35 * +t.dataset.tick - (t.dataset.tick > 0 ? 600 : 0)) + 'px,0,0)'; });
        var zr = zero.getBoundingClientRect(), zp = Math.max(0, Math.min(1, (vh - zr.top) / (vh * .8)));
        zero.style.setProperty('--z', (0.55 + zp * 0.45).toFixed(3));
        var br = band.getBoundingClientRect(), bp = Math.max(0, Math.min(1, (vh - br.top) / (vh * .9)));
        band.style.setProperty('--w', ((1 - bp) * (innerWidth < 760 ? 12 : 30)).toFixed(2) + '%'); band.style.setProperty('--br', ((1 - bp) * 28).toFixed(1) + 'px');
      }
      // journey rail
      var cur = 0; order.forEach(function (id, k) { var el = document.getElementById(id); if (el && el.getBoundingClientRect().top < vh * .5) cur = k; });
      rl.forEach(function (a, k) { a.classList.toggle('on', k === cur); });
      rail.classList.toggle('on', scrollY > vh * .6);
      var dk = false; ['hero', 'explore', 'choose', 'services', 'pathway', 'begin'].forEach(function (id) { var r = document.getElementById(id).getBoundingClientRect(); if (r.top < vh / 2 && r.bottom > vh / 2) dk = true; });
      var mid = document.elementFromPoint(innerWidth - 30, vh / 2); var darkSec = mid && mid.closest('.on-dark,.explore,.depart,.hero,.ticker--dark,.band');
      rail.classList.toggle('dark', !!darkSec || dk);
    });
    addEventListener('scroll', run, { passive: true }); addEventListener('resize', run); run();

  })();

  $('#yr').textContent = new Date().getFullYear();
})();
