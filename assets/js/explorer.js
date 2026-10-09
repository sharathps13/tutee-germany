/* Tutee Connect — Germany University Explorer: search, filters, map ↔ detail sync, enquiry hand-off */
function tcExplorer(U) {
  'use strict';
  var $ = function (s) { return document.querySelector(s); }, NS = 'http://www.w3.org/2000/svg';
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var AREAS = ['Engineering', 'Computer Science', 'Business & Economics', 'Natural Sciences', 'Medicine & Life Sciences', 'Social Sciences', 'Law', 'Humanities', 'Architecture'];
  var FALLBACK = '1467269204594-9661b134dd2b';
  var img = function (u, w, h) { return u.img ? 'https://images.unsplash.com/photo-' + u.img + '?auto=format&fit=crop&w=' + w + (h ? '&h=' + h : '') + '&q=80' : ''; };
  var norm = function (s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss'); };
  U.forEach(function (u, i) { u.i = i; u.x = (u.lon - 3.5) * 30; u.y = (55.6 - u.lat) * 30; u.hay = norm([u.name, u.full || '', u.s, u.id, u.city, u.state, u.type, u.tu9 ? 'tu9' : ''].join(' ')); });

  /* spread universities that share a city around the city point */
  var byCity = {};
  U.forEach(function (u) { (byCity[u.city] = byCity[u.city] || []).push(u); });
  Object.keys(byCity).forEach(function (c) {
    var g = byCity[c], cx = g.reduce(function (a, u) { return a + u.x; }, 0) / g.length, cy = g.reduce(function (a, u) { return a + u.y; }, 0) / g.length;
    g.forEach(function (u, k) { u.cx = cx; u.cy = cy; if (g.length > 1) { var a = -Math.PI / 2 + k * 2 * Math.PI / g.length; u.px = cx + Math.cos(a) * 6.5; u.py = cy + Math.sin(a) * 6.5; } else { u.px = u.x; u.py = u.y; } });
  });

  var st = { q: '', type: '', city: '', area: '' }, list = U.slice(), cur = null;

  /* ---------- filters UI ---------- */
  var citySel = $('#f-city');
  Object.keys(byCity).sort(function (a, b) { return a.localeCompare(b); }).forEach(function (c) { var o = document.createElement('option'); o.value = c; o.textContent = c + ' (' + byCity[c].length + ')'; citySel.appendChild(o); });
  var chips = $('#f-area');
  AREAS.forEach(function (a) { var b = document.createElement('button'); b.type = 'button'; b.textContent = a; b.dataset.v = a; b.setAttribute('aria-pressed', 'false'); chips.appendChild(b); });

  /* ---------- map ---------- */
  var pins = $('#pins'), cities = $('#cities'), tip = $('#tip'), map = $('#xmap'), svg = map.querySelector('svg');
  Object.keys(byCity).forEach(function (c) {
    var u = byCity[c][0], t = document.createElementNS(NS, 'text');
    t.setAttribute('class', 'cityl'); t.dataset.c = c; t.textContent = c;
    t.setAttribute('x', u.cx + (byCity[c].length > 1 ? 10 : 6)); t.setAttribute('y', u.cy + 2.2);
    if (byCity[c].length < 2) t.style.display = 'none';
    cities.appendChild(t);
  });
  U.forEach(function (u, k) {
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'mk pop' + (u.type === 'Private' ? ' pri' : '')); g.dataset.id = u.id;
    g.setAttribute('transform', 'translate(' + u.px.toFixed(1) + ' ' + u.py.toFixed(1) + ')');
    g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-label', u.name + ', ' + u.city + ', ' + u.type.toLowerCase());
    g.innerHTML = '<circle class="h" r="7"/><circle class="r" r="6"/><circle class="d" r="3"/>';
    g.querySelector('.d').style.animationDelay = (reduce ? 0 : .4 + k * .025) + 's';
    u.mk = g; pins.appendChild(g);
  });
  function showTip(u) {
    var r = svg.getBoundingClientRect(), m = map.getBoundingClientRect(), vb = svg.viewBox.baseVal, k = r.width / vb.width;
    tip.style.left = (r.left - m.left + (u.px - vb.x) * k) + 'px'; tip.style.top = (r.top - m.top + (u.py - vb.y) * k) + 'px';
    $('#tip-n').textContent = u.name; $('#tip-c').textContent = u.city + (u.state !== u.city ? ' · ' + u.state : '') + ' · Germany';
    var t = $('#tip-t'); t.textContent = u.type === 'Public' ? 'Public' : 'Private'; t.className = u.type === 'Private' ? 'pri' : '';
    $('#tip-im').style.backgroundImage = 'url(' + (img(u, 160, 160) || 'https://images.unsplash.com/photo-' + FALLBACK + '?auto=format&fit=crop&w=160&h=160&q=70') + ')';
    tip.classList.add('on'); u.mk.classList.add('hov'); labelCity(u.city, true);
  }
  function hideTip(u) { tip.classList.remove('on'); if (u) { u.mk.classList.remove('hov'); labelCity(u.city, false); } }
  function labelCity(c, on) { var t = cities.querySelector('[data-c="' + c + '"]'); if (!t) return; if (byCity[c].length < 2) t.style.display = on || (cur && cur.city === c) ? '' : 'none'; }
  var byId = {}; U.forEach(function (u) { byId[u.id] = u; });
  pins.addEventListener('pointerover', function (e) { var g = e.target.closest('.mk'); if (g) showTip(byId[g.dataset.id]); });
  pins.addEventListener('pointerout', function (e) { var g = e.target.closest('.mk'); if (g) hideTip(byId[g.dataset.id]); });
  pins.addEventListener('click', function (e) { var g = e.target.closest('.mk'); if (g) { select(byId[g.dataset.id]); hideTip(byId[g.dataset.id]); } });
  pins.addEventListener('focusin', function (e) { var g = e.target.closest('.mk'); if (g) showTip(byId[g.dataset.id]); });
  pins.addEventListener('focusout', function (e) { var g = e.target.closest('.mk'); if (g) hideTip(byId[g.dataset.id]); });
  pins.addEventListener('keydown', function (e) { var g = e.target.closest('.mk'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(byId[g.dataset.id]); } });

  /* ---------- detail card ---------- */
  var imA = $('#im-a'), imB = $('#im-b'), front = imA, swapT;
  function setImage(u) {
    var back = front === imA ? imB : imA, src = img(u, 1200, 600);
    clearTimeout(swapT);
    var go = function () { back.classList.add('on'); front.classList.remove('on'); front = back; };
    if (!src) { back.style.backgroundImage = ''; back.classList.add('fb'); go(); return; }
    back.classList.remove('fb');
    var pre = new Image(); pre.onload = function () { back.style.backgroundImage = 'url(' + src + ')'; go(); };
    pre.onerror = function () { back.style.backgroundImage = ''; back.classList.add('fb'); go(); };
    pre.src = src; swapT = setTimeout(function () { if (!pre.complete) { back.style.backgroundImage = ''; back.classList.add('fb'); go(); pre.onload = pre.onerror = null; } }, 2500);
  }
  function anim(el) { el.classList.remove('sw'); void el.offsetWidth; el.classList.add('sw'); }
  function select(u, opt) {
    if (!u) return; opt = opt || {};
    if (opt.light && u === cur) { var ps = list.indexOf(u); $('#c-idx').textContent = ps >= 0 ? String(ps + 1).padStart(2, '0') + ' / ' + String(list.length).padStart(2, '0') : 'OUTSIDE FILTER'; return; }
    var prev = cur; cur = u;
    if (prev) { prev.mk.classList.remove('on'); labelCity(prev.city, false); var pc = cities.querySelector('[data-c="' + prev.city + '"]'); if (pc) pc.classList.remove('on'); }
    u.mk.classList.add('on'); pins.appendChild(u.mk); labelCity(u.city, true);
    var cl = cities.querySelector('[data-c="' + u.city + '"]'); if (cl) cl.classList.add('on');
    var pos = list.indexOf(u), n = list.length;
    $('#c-idx').textContent = pos >= 0 ? String(pos + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0') : 'OUTSIDE FILTER';
    $('#c-ll').textContent = Math.abs(u.lat).toFixed(2) + '°N · ' + u.lon.toFixed(2) + '°E';
    var g = $('#c-giant'); g.textContent = u.s;
    $('#c-name').textContent = u.name; anim($('#c-name'));
    $('#c-full').textContent = u.full && u.full !== u.name ? u.full : '';
    $('#c-where').textContent = u.city + (u.state !== u.city ? ' · ' + u.state : '') + ' · Germany';
    var b = $('#c-type'); b.textContent = u.type === 'Public' ? 'Public university' : 'Private · state-recognised'; b.className = 'xbadge' + (u.type === 'Private' ? ' pri' : '');
    $('#c-tu9').hidden = !u.tu9;
    $('#c-areas').innerHTML = u.areas.map(function (a, k) { return '<li style="animation-delay:' + k * .05 + 's">' + a + '</li>'; }).join('');
    $('#c-rank').textContent = u.rank ? 'Ranking: ' + u.rank.value + ' — ' + u.rank.source + ' ' + u.rank.year + '. Rankings vary by source, subject and year.' : 'Rankings vary by source, subject and year — ask your advisor for current figures.';
    $('#c-web').href = u.web;
    $('#c-enq').href = 'index.html?uni=' + encodeURIComponent(u.name) + '#begin';
    setImage(u);
    $$rows().forEach(function (li) { li.classList.toggle('on', li.dataset.id === u.id); });
    if (!opt.silent) { try { history.replaceState(null, '', '?u=' + u.id); } catch (e) {} try { if (window.parent !== window && parent.__sync) parent.__sync('universities.html?u=' + u.id); } catch (e) {} }
    if (opt.scroll && innerWidth <= 980) $('#card').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  function $$rows() { return Array.prototype.slice.call(document.querySelectorAll('#rows .xrow')); }
  function step(d) { if (!list.length) return; var p = list.indexOf(cur); select(list[(p < 0 ? 0 : p + d + list.length) % list.length]); }
  $('#prev').addEventListener('click', function () { step(-1); });
  $('#next').addEventListener('click', function () { step(1); });
  addEventListener('keydown', function (e) { if (/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return; if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); });
  var cardEl = $('#card'), sx = null;
  cardEl.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  cardEl.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1); sx = null; });

  /* ---------- search + filter ---------- */
  function apply() {
    var terms = norm(st.q).split(/\s+/).filter(Boolean);
    list = U.filter(function (u) {
      if (st.type && u.type !== st.type) return false;
      if (st.city && u.city !== st.city) return false;
      if (st.area && u.areas.indexOf(st.area) < 0) return false;
      return terms.every(function (t) { return u.hay.indexOf(t) >= 0; });
    });
    var ids = {}; list.forEach(function (u) { ids[u.id] = 1; });
    U.forEach(function (u) { u.mk.classList.toggle('off', !ids[u.id]); });
    var rows = $('#rows');
    rows.innerHTML = list.map(function (u, k) {
      return '<li class="xrow' + (cur === u ? ' on' : '') + '" data-id="' + u.id + '" style="animation-delay:' + Math.min(k * .025, .4) + 's"><button type="button"><span class="n mono">' + String(k + 1).padStart(2, '0') + '</span><span><b>' + u.name + '</b><small>' + u.city + (u.state !== u.city ? ' · ' + u.state : '') + (u.tu9 ? ' · TU9' : '') + '</small></span><span class="t' + (u.type === 'Private' ? ' pri' : '') + '">' + u.type + '</span></button></li>';
    }).join('');
    var n = list.length, cn = Object.keys(list.reduce(function (a, u) { a[u.city] = 1; return a; }, {})).length;
    $('#count').textContent = n + ' / ' + U.length;
    $('#map-n').textContent = n + (n === 1 ? ' university' : ' universities') + ' · ' + cn + (cn === 1 ? ' city' : ' cities');
    $('#list-sum').textContent = n ? 'Showing ' + n + ' of ' + U.length + ' universities' : '';
    $('#empty').hidden = !!n; rows.hidden = !n;
    $('#f-reset').hidden = !(st.type || st.city || st.area || st.q);
    if (n && list.indexOf(cur) < 0) select(list[0], { silent: true });
    else if (cur) select(cur, { silent: true, light: true });
  }
  $('#rows').addEventListener('click', function (e) { var li = e.target.closest('.xrow'); if (li) select(byId[li.dataset.id], { scroll: true }); });
  var qT; $('#q').addEventListener('input', function () { var v = this.value; clearTimeout(qT); qT = setTimeout(function () { st.q = v; apply(); }, 90); });
  $('#f-type').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.type = b.dataset.v; this.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-checked', x === b); }); apply(); });
  citySel.addEventListener('change', function () { st.city = this.value; apply(); });
  chips.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.area = st.area === b.dataset.v ? '' : b.dataset.v; chips.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.v === st.area); }); apply(); });
  function reset() { st = { q: '', type: '', city: '', area: '' }; $('#q').value = ''; citySel.value = ''; chips.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); $('#f-type').querySelectorAll('button').forEach(function (x, k) { x.setAttribute('aria-checked', k === 0); }); apply(); }
  $('#f-reset').addEventListener('click', reset); $('#empty-reset').addEventListener('click', reset);

  /* ---------- boot: ?u=id or ?q=text ---------- */
  var p = new URLSearchParams(window.__Q || location.search);
  if (p.get('q')) { st.q = p.get('q'); $('#q').value = st.q; }
  apply();
  select(byId[p.get('u')] || list[0] || U[0], { silent: true });
  setTimeout(function () { U.forEach(function (u) { if (u.img) new Image().src = img(u, 160, 160); }); }, 2500);
}


/* ---------- data loader: one shared dataset (assets/js/unis-de.js), never a silent empty state ---------- */
(function () {
  var box = document.getElementById('xload'), started = false;
  function ok(d) { return Array.isArray(d) && d.length > 0; }
  function state(s) { if (!box) return; box.dataset.state = s; box.hidden = s === 'ready'; document.documentElement.classList.toggle('x-loading', s !== 'ready'); }
  function start() { if (started) return; started = true; state('ready'); tcExplorer(window.TC_UNIS); }
  function inject(src, cb) { var s = document.createElement('script'); s.src = src + (src.indexOf('?') < 0 ? '?r=' + Date.now() : ''); s.onload = function () { cb(ok(window.TC_UNIS)); }; s.onerror = function () { cb(false); }; document.head.appendChild(s); }
  function load() {
    if (ok(window.TC_UNIS)) return start();
    state('loading');
    var srcs = ['assets/js/unis-de.js', '/assets/js/unis-de.js'], k = 0;
    (function next() {
      if (k >= srcs.length) return state('error');
      inject(srcs[k++], function (good) { if (good) start(); else next(); });
    })();
  }
  var retry = document.getElementById('xload-retry'); if (retry) retry.addEventListener('click', load);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
  window.addEventListener('pageshow', function (e) { if (e.persisted && !started) load(); });
})();

/* ---------- hero: rotating Germany university scenes (decorative; never touches the UI layer) ---------- */
(function () {
  var root = document.getElementById('xbg'); if (!root) return;
  var S = Array.prototype.slice.call(root.querySelectorAll('.xbg__s')), bars = document.querySelectorAll('#xbg-prog .xbg__bars i'), num = document.getElementById('xbg-n');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, HOLD = 3000, i = 0, t = null, visible = true, busy = false;
  if (S.length < 2) return;
  function ready(k) { // preload + decode the slide before it is ever shown
    var im = S[k].querySelector('img');
    if (!im.dataset.src) return im.complete && im.naturalWidth ? Promise.resolve() : new Promise(function (r) { im.onload = im.onerror = r; });
    im.srcset = im.dataset.srcset; im.src = im.dataset.src; delete im.dataset.src; delete im.dataset.srcset;
    return (im.decode ? im.decode() : new Promise(function (r) { im.onload = r; })).catch(function () {});
  }
  function mark() { num.textContent = String(i + 1).padStart(2, '0'); Array.prototype.forEach.call(bars, function (b, k) { b.className = k < i ? 'done' : ''; if (k === i) { void b.offsetWidth; b.className = 'run'; } }); }
  function schedule() { clearTimeout(t); if (!visible || reduce || document.hidden) return; t = setTimeout(next, HOLD); ready((i + 1) % S.length); }
  function next() {
    if (busy) return; busy = true; var n = (i + 1) % S.length;
    ready(n).then(function () {
      S[i].classList.remove('on'); S[i].classList.add('out');
      var prev = S[i]; setTimeout(function () { prev.classList.remove('out'); }, 1700);
      S[n].classList.add('on'); i = n; mark(); busy = false; schedule();
    });
  }
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) { mark(); schedule(); } else clearTimeout(t); }).observe(root);
  document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(t); else schedule(); });
  mark(); schedule();
})();

/* magnetic CTA — same behaviour as the main page (.mag) */
(function () {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.mag').forEach(function (b) {
    b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * .16 + 'px,' + (e.clientY - r.top - r.height / 2) * .26 + 'px)'; });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  });
})();
