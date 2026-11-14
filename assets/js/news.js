/* The Tutee Times — Germany edition: a broadcast-style news line (ticker) and a full front page
   that unfolds from it. Ported from the USA landing page; stories come from news-de.js. */
(function () {
  var tkr = document.querySelector('[data-tkr]'), wrap = document.querySelector('[data-paper]');
  if (!tkr || !wrap) return;
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sheet = $('[data-paper-sheet]', wrap), body = $('[data-paper-body]', wrap), lastFocus = null;
  var CTA = { contact: ['Claim free counselling', '#begin'], costs: ['See costs & funding', '#afford'], pathway: ['See the pathway', '#pathway'], unis: ['Explore universities', 'universities.html'] };
  var ARW = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var ARL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';
  var data = window.TC_NEWS || {}, pool = (data.pool || []).filter(function (s) { return s && s.headline && s.show !== false; }), eds = [], cur = 0;
  if (!pool.length) { tkr.hidden = true; return; }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function isoOf(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function today() { return isoOf(new Date()); }
  function fmt(iso, long) { var p = iso.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); return d.toLocaleDateString('en-GB', long ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } : { day: 'numeric', month: 'short', year: 'numeric' }); }
  // a fresh edition every day: rotate the story pool by date (same edition for everyone on the same day)
  function compose(iso) {
    var n = pool.length, p = iso.split('-'), day = Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5), start = (day * 5) % n, pick = [];
    for (var k = 0; pick.length < Math.min(7, n) && k < n * 3; k++) { var s = pool[(start + k * 3) % n]; if (pick.indexOf(s) < 0) pick.push(s); }
    for (var j = 0; pick.length < Math.min(7, n); j++) if (pick.indexOf(pool[j]) < 0) pick.push(pool[j]);
    return { date: iso, lead: pick[0], stories: pick.slice(1) };
  }
  function prep() {
    var now = new Date(); eds = [];
    for (var i = 0; i < 7; i++) eds.push(compose(isoOf(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i))));
    cur = 0; ticker();
  }
  function all(e) { return [e.lead].concat(e.stories || []).filter(Boolean); }
  function ticker() {
    var e = eds[0]; $('[data-tkr-date]', tkr).textContent = fmt(e.date);
    var li = all(e).map(function (s, i) { return '<li><button type="button" data-tkr-i="' + i + '"><b>' + esc(s.section) + '</b>' + esc(s.headline) + '</button></li>'; }).join('');
    var run = $('[data-tkr-run]', tkr); run.innerHTML = li + li.replace(/<li>/g, '<li aria-hidden="true">').replace(/<button /g, '<button tabindex="-1" ');
    run.style.setProperty('--tkr-dur', Math.max(40, all(e).length * 11) + 's');
  }
  function storyHTML(s, i, lead) {
    var c = s.cta && CTA[s.cta] ? '<a class="paper__cta" href="' + CTA[s.cta][1] + '" data-paper-go>' + CTA[s.cta][0] + ' →</a>' : '';
    var src = s.source ? '<p class="paper__src">Source: ' + (s.url && /^https:\/\//.test(s.url) ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.source) + '</a>' : esc(s.source)) + '</p>' : '';
    var paras = (s.body || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    return '<section class="paper__story' + (lead ? ' paper__story--lead' : '') + '" data-story="' + i + '">' +
      '<p class="paper__sec">' + esc(s.section) + '</p><h3 class="paper__hl">' + esc(s.headline) + '</h3>' + (s.deck ? '<p class="paper__deck">' + esc(s.deck) + '</p>' : '') +
      '<div class="paper__copy">' + paras + src + c + '</div>' +
      (lead ? '' : '<button type="button" class="paper__more" data-more aria-expanded="false">Continued ▸</button>') + '</section>';
  }
  function render() {
    var e = eds[cur]; if (!e) return;
    $('[data-paper-name]', wrap).textContent = data.paper || 'The Tutee Times';
    $('[data-paper-motto]', wrap).textContent = '“' + (data.motto || 'All the news a Germany-bound student needs') + '”';
    var p0 = e.date.split('-'), no = Math.floor((Date.UTC(+p0[0], +p0[1] - 1, +p0[2]) - Date.UTC(2026, 10, 1)) / 864e5) + 1;
    $('[data-paper-vol]', wrap).textContent = 'VOL. I · No. ' + Math.max(1, no);
    $('[data-paper-date]', wrap).textContent = fmt(e.date, true).toUpperCase();
    var st = e.stories || [];
    body.innerHTML = '<div class="paper__top">' + storyHTML(e.lead, 0, true) + '<div class="paper__side">' + st.slice(0, 2).map(function (s, i) { return storyHTML(s, i + 1); }).join('') + '</div></div>' +
      '<div class="paper__cols">' + st.slice(2).map(function (s, i) { return storyHTML(s, i + 3); }).join('') + '</div>';
    $('[data-paper-index]', wrap).innerHTML = all(e).map(function (s, i) { return '<button type="button" data-jump="' + i + '">' + esc(s.section) + '</button>'; }).join('<span aria-hidden="true">·</span>');
    $('[data-paper-prev]', wrap).disabled = cur >= eds.length - 1;
    var nx = $('[data-paper-next]', wrap); nx.disabled = cur <= 0; nx.classList.toggle('is-wait', cur <= 0); clock();
  }
  var clockT = 0;
  function clock() {
    clearTimeout(clockT); var nx = $('[data-paper-next]', wrap);
    if (cur > 0) { nx.innerHTML = '<span>Next edition</span>' + ARW; return; }
    var n = new Date(), m = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), left = Math.max(0, m - n), h = Math.floor(left / 36e5), mi = Math.floor(left % 36e5 / 6e4);
    nx.innerHTML = '<span>Tomorrow’s edition in <b>' + h + 'h ' + ('0' + mi).slice(-2) + 'm</b></span>';
    if (!wrap.hidden) clockT = setTimeout(function () { if (today() !== eds[0].date) { prep(); render(); } else clock(); }, 30000);
  }
  function open(i) {
    lastFocus = document.activeElement; cur = 0; render();
    wrap.hidden = false; document.documentElement.classList.add('paper-open');
    requestAnimationFrame(function () { wrap.classList.add('is-open'); });
    sheet.scrollTop = 0; try { sheet.focus({ preventScroll: true }); } catch (x) {}
    if (i > 0) setTimeout(function () { reveal(i); }, reduce ? 0 : 650);
  }
  function close() {
    wrap.classList.remove('is-open'); document.documentElement.classList.remove('paper-open');
    setTimeout(function () { wrap.hidden = true; }, reduce ? 0 : 450);
    if (lastFocus) try { lastFocus.focus({ preventScroll: true }); } catch (x) {}
  }
  function reveal(i) {
    var s = $('[data-story="' + i + '"]', body); if (!s) return;
    var m = $('[data-more]', s); if (m && m.getAttribute('aria-expanded') !== 'true') m.click();
    s.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); s.classList.remove('is-flash'); void s.offsetWidth; s.classList.add('is-flash');
  }
  function turn() { sheet.classList.remove('is-turn'); void sheet.offsetWidth; sheet.classList.add('is-turn'); setTimeout(function () { render(); sheet.scrollTop = 0; }, reduce ? 0 : 260); }
  $('[data-paper-prev]', wrap).innerHTML = ARL + '<span>Previous edition</span>';
  tkr.addEventListener('click', function (ev) { var b = ev.target.closest('[data-tkr-i]'); if (b) open(+b.getAttribute('data-tkr-i')); });
  $$('[data-paper-open]').forEach(function (b) { b.addEventListener('click', function () { open(0); }); });
  $$('[data-paper-close]', wrap).forEach(function (b) { b.addEventListener('click', close); });
  wrap.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { ev.preventDefault(); close(); return; }
    if (ev.key !== 'Tab') return;
    var f = $$('button:not([disabled]), a[href]', sheet).filter(function (x) { return x.offsetParent !== null; }); if (!f.length) return;
    if (ev.shiftKey && document.activeElement === f[0]) { ev.preventDefault(); f[f.length - 1].focus(); } else if (!ev.shiftKey && document.activeElement === f[f.length - 1]) { ev.preventDefault(); f[0].focus(); }
  });
  body.addEventListener('click', function (ev) {
    var m = ev.target.closest('[data-more]');
    if (m) { var s = m.closest('.paper__story'), on = m.getAttribute('aria-expanded') !== 'true'; s.classList.toggle('is-open', on); m.setAttribute('aria-expanded', String(on)); m.textContent = on ? 'Fold ▴' : 'Continued ▸'; }
    if (ev.target.closest('[data-paper-go]')) close();
  });
  $('[data-paper-index]', wrap).addEventListener('click', function (ev) { var b = ev.target.closest('[data-jump]'); if (b) reveal(+b.getAttribute('data-jump')); });
  $('[data-paper-prev]', wrap).addEventListener('click', function () { if (cur < eds.length - 1) { cur++; turn(); } });
  $('[data-paper-next]', wrap).addEventListener('click', function () { if (cur > 0) { cur--; turn(); } });
  // pause the moving line while it is off screen
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { tkr.classList.toggle('is-off', !es[0].isIntersecting); }).observe(tkr);
  prep();
  var day0 = today(); setInterval(function () { if (today() !== day0) { day0 = today(); prep(); } }, 60000);
})();
