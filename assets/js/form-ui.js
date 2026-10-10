/* Tutee Connect — passport form upgrades: custom dropdowns, searchable country codes,
   live phone/e-mail validation, WhatsApp contact panel. Vanilla JS, no dependencies.
   The native <select>s stay in the form (hidden) as the source of truth, so FormData and the
   existing submit flow are untouched. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ---------- small flags (simplified, 3:2) ---------- */
  var F = {
    IN: '<rect width="30" height="7" fill="#ff9933"/><rect y="7" width="30" height="6" fill="#fff"/><rect y="13" width="30" height="7" fill="#138808"/><circle cx="15" cy="10" r="2.2" fill="none" stroke="#000080" stroke-width=".9"/>',
    AE: '<rect width="30" height="7" fill="#00732f"/><rect y="7" width="30" height="6" fill="#fff"/><rect y="13" width="30" height="7" fill="#000"/><rect width="8" height="20" fill="#ff0000"/>',
    LK: '<rect width="30" height="20" fill="#ffb700"/><rect x="2" y="2" width="5" height="16" fill="#005f56"/><rect x="7" y="2" width="5" height="16" fill="#ff5b00"/><rect x="13" y="2" width="15" height="16" fill="#8d153a"/>',
    NP: '<rect width="30" height="20" fill="#fff"/><path d="M9 1l12 9H12l9 9H9z" fill="#dc143c" stroke="#003893" stroke-width="1.2"/>',
    BD: '<rect width="30" height="20" fill="#006a4e"/><circle cx="13.5" cy="10" r="5.5" fill="#f42a41"/>',
    DE: '<rect width="30" height="7" fill="#000"/><rect y="7" width="30" height="6" fill="#dd0000"/><rect y="13" width="30" height="7" fill="#ffce00"/>',
    SA: '<rect width="30" height="20" fill="#006c35"/><rect x="8" y="12" width="14" height="1.6" fill="#fff"/><rect x="9" y="6" width="12" height="3" rx="1" fill="#fff" opacity=".85"/>',
    QA: '<rect width="30" height="20" fill="#8a1538"/><path d="M0 0h9l3 1.1-3 1.1 3 1.1-3 1.1 3 1.1-3 1.1 3 1.1-3 1.1 3 1.1-3 1.1 3 1.1-3 1.1 3 1.1-3 1.1 3 1.1-3 1.1 3 1.1-3 1.1H0z" fill="#fff"/>',
    SG: '<rect width="30" height="10" fill="#ef3340"/><rect y="10" width="30" height="10" fill="#fff"/><circle cx="7" cy="5" r="3" fill="#fff"/><circle cx="8.2" cy="5" r="3" fill="#ef3340"/>',
    GB: '<rect width="30" height="20" fill="#012169"/><path d="M0 0l30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0l30 20M30 0L0 20" stroke="#c8102e" stroke-width="1.6"/><path d="M15 0v20M0 10h30" stroke="#fff" stroke-width="6"/><path d="M15 0v20M0 10h30" stroke="#c8102e" stroke-width="3.4"/>',
    US: '<rect width="30" height="20" fill="#fff"/><g fill="#b22234"><rect width="30" height="1.6"/><rect y="3.1" width="30" height="1.5"/><rect y="6.2" width="30" height="1.5"/><rect y="9.2" width="30" height="1.5"/><rect y="12.3" width="30" height="1.5"/><rect y="15.4" width="30" height="1.5"/><rect y="18.4" width="30" height="1.6"/></g><rect width="13" height="10.8" fill="#3c3b6e"/>',
    WORLD: '<rect width="30" height="20" rx="2" fill="#123a3a"/><circle cx="15" cy="10" r="6.5" fill="none" stroke="#9fd3c9" stroke-width="1.1"/><ellipse cx="15" cy="10" rx="2.8" ry="6.5" fill="none" stroke="#9fd3c9" stroke-width="1"/><path d="M8.5 10h13" stroke="#9fd3c9" stroke-width="1"/>'
  };
  function flag(k) { return '<svg class="fl" viewBox="0 0 30 20" width="21" height="14" aria-hidden="true"><clipPath id="c' + k + '"><rect width="30" height="20" rx="2.5"/></clipPath><g clip-path="url(#c' + k + ')">' + (F[k] || F.WORLD) + '</g></svg>'; }

  /* ---------- phone rules: national significant number, per calling code ---------- */
  // trunk: a leading 0 typed out of habit is dropped before checking
  var CC = {
    '+91': { k: 'IN', n: 'India', trunk: 1, ok: function (d) { return /^[6-9]\d{9}$/.test(d); }, ex: '98765 43210' },
    '+971': { k: 'AE', n: 'United Arab Emirates', trunk: 1, ok: function (d) { return /^5[024568]\d{7}$/.test(d) || /^[2-79]\d{7}$/.test(d); }, ex: '50 123 4567' },
    '+94': { k: 'LK', n: 'Sri Lanka', trunk: 1, ok: function (d) { return /^7[0-8]\d{7}$/.test(d) || /^[1-689]\d{8}$/.test(d); }, ex: '71 234 5678' },
    '+977': { k: 'NP', n: 'Nepal', trunk: 1, ok: function (d) { return /^9[678]\d{8}$/.test(d) || /^[1-8]\d{6,7}$/.test(d); }, ex: '984 123 4567' },
    '+880': { k: 'BD', n: 'Bangladesh', trunk: 1, ok: function (d) { return /^1[3-9]\d{8}$/.test(d) || /^[2-9]\d{6,9}$/.test(d); }, ex: '1712 345678' },
    '+49': { k: 'DE', n: 'Germany', trunk: 1, ok: function (d) { return /^1[5-7]\d{8,9}$/.test(d) || /^[2-9]\d{5,10}$/.test(d); }, ex: '1512 3456789' },
    '+966': { k: 'SA', n: 'Saudi Arabia', trunk: 1, ok: function (d) { return /^5\d{8}$/.test(d) || /^1\d{7}$/.test(d); }, ex: '50 123 4567' },
    '+974': { k: 'QA', n: 'Qatar', trunk: 0, ok: function (d) { return /^[3-7]\d{7}$/.test(d); }, ex: '3312 3456' },
    '+65': { k: 'SG', n: 'Singapore', trunk: 0, ok: function (d) { return /^[689]\d{7}$/.test(d); }, ex: '8123 4567' },
    '+44': { k: 'GB', n: 'United Kingdom', trunk: 1, ok: function (d) { return /^7\d{9}$/.test(d) || /^[1-35-9]\d{8,9}$/.test(d); }, ex: '7400 123456' },
    '+1': { k: 'US', n: 'USA / Canada', trunk: 0, ok: function (d) { return /^1?[2-9]\d{2}[2-9]\d{6}$/.test(d); }, ex: '415 555 0132' }
  };
  function phoneState(cc, raw) {
    var r = CC[cc], d = String(raw || '').replace(/\D/g, '');
    if (!d) return 'empty';
    if (r && r.trunk && d.length > 1 && d.charAt(0) === '0') d = d.slice(1);
    if (!r) return d.length >= 7 && d.length <= 15 ? 'ok' : 'bad';
    return r.ok(d) ? 'ok' : 'bad';
  }
  var EMAIL = /^[A-Za-z0-9._%+'-]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;
  function emailState(v) {
    v = String(v || '').trim(); if (!v) return 'empty';
    var local = v.split('@')[0];
    return EMAIL.test(v) && local.charAt(0) !== '.' && local.slice(-1) !== '.' && v.indexOf('..') < 0 ? 'ok' : 'bad';
  }
  // shared with app.js's submit check
  window.TCV = { phoneOk: function (cc, n) { return phoneState(cc, n) === 'ok'; }, emailOk: function (v) { return emailState(v) === 'ok'; } };

  var form = $('#pass'); if (!form) return;

  /* ---------- field state: nothing shown until the user has left the field once ---------- */
  function mark(input, state, msg) {
    var pf = input.closest('.pf'), err = pf && pf.querySelector('.err'); if (!pf) return;
    pf.classList.toggle('bad', state === 'bad' || state === 'empty');
    pf.classList.toggle('ok', state === 'ok');
    input.setAttribute('aria-invalid', state === 'ok' ? 'false' : 'true');
    if (err && msg) err.textContent = msg;
  }
  function clear(input) { var pf = input.closest('.pf'); if (pf) pf.classList.remove('bad', 'ok'); input.removeAttribute('aria-invalid'); }
  function live(input, check, msgs) {
    var touched = false;
    function run(force) {
      var s = check();
      if (!touched && !force) { if (s === 'ok' && input.value) mark(input, 'ok'); return s; }
      if (s === 'empty') mark(input, 'empty', msgs.empty); else if (s === 'bad') mark(input, 'bad', msgs.bad()); else mark(input, 'ok');
      return s;
    }
    input.addEventListener('blur', function () { if (input.value.trim()) touched = true; if (touched) run(); });
    input.addEventListener('input', function () { if (touched) run(); else if (check() === 'ok') mark(input, 'ok'); else clear(input); });
    return { run: function () { touched = true; return run(true); } };
  }
  var phone = $('#p-phone'), email = $('#p-email'), cc = $('#p-cc'), err0 = phone.closest('.pf').querySelector('.err');
  err0.id = 'p-phone-err'; phone.setAttribute('aria-describedby', 'p-phone-err');
  email.closest('.pf').querySelector('.err').id = 'p-email-err'; email.setAttribute('aria-describedby', 'p-email-err');
  var vPhone = live(phone, function () { return phoneState(cc.value, phone.value); }, {
    empty: 'Please enter your phone number.',
    bad: function () { var r = CC[cc.value]; return 'Please enter a valid phone number' + (r ? ' (e.g. ' + r.ex + ')' : '') + '.'; } });
  var vEmail = live(email, function () { return emailState(email.value); }, { empty: 'Please enter your email address.', bad: function () { return 'Please enter a valid email address.'; } });
  // final gate (capture phase: runs before app.js's submit handler, which also checks TCV)
  form.addEventListener('submit', function (e) {
    var a = vPhone.run(), b = vEmail.run();
    if (a !== 'ok' || b !== 'ok') { e.preventDefault(); e.stopImmediatePropagation(); var f = form.querySelector('.pf.bad input'); if (f) f.focus(); }
  }, true);

  /* ---------- custom dropdown (listbox pattern) over a hidden native <select> ---------- */
  var openDD = null, uid = 0;
  function closeAll(except) { if (openDD && openDD !== except) openDD.close(false); }
  document.addEventListener('pointerdown', function (e) { if (openDD && !openDD.root.contains(e.target)) openDD.close(false); });

  function dropdown(sel, opt) {
    opt = opt || {};
    var id = 'dd' + (++uid), items = [].slice.call(sel.options).map(function (o) { return { v: o.value, t: o.textContent, o: o }; });
    var root = document.createElement('div'); root.className = 'dd' + (opt.cls ? ' ' + opt.cls : '');
    var label = sel.id && form.querySelector('label[for="' + sel.id + '"]');
    root.innerHTML = '<button type="button" class="dd__btn" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + id + '-l"' +
      (label ? ' aria-labelledby="' + (label.id = label.id || id + '-lab') + ' ' + id + '-v"' : ' aria-label="' + (sel.getAttribute('aria-label') || '') + '"') + '>' +
      '<span class="dd__v" id="' + id + '-v"></span><svg class="dd__chev" viewBox="0 0 12 8" width="12" height="8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="dd__pop" hidden>' + (opt.search ? '<div class="dd__s"><svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M13 13l4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><input type="text" placeholder="Search country or code" aria-label="Search countries" autocomplete="off"></div>' : '') +
      '<ul class="dd__l" role="listbox" id="' + id + '-l" tabindex="-1"></ul><p class="dd__none" hidden>No match</p></div>';
    sel.classList.add('dd-native'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    sel.parentNode.insertBefore(root, sel.nextSibling);
    if (label) label.addEventListener('click', function (e) { e.preventDefault(); btn.focus(); });
    var isOpen = false, btn = root.querySelector('.dd__btn'), pop = root.querySelector('.dd__pop'), list = root.querySelector('.dd__l'), q = root.querySelector('.dd__s input'), none = root.querySelector('.dd__none'), act = -1, shown = items;
    function render() {
      list.innerHTML = shown.map(function (it, i) {
        return '<li role="option" id="' + id + '-o' + i + '" data-v="' + it.v + '" aria-selected="' + (it.v === sel.value) + '">' + (opt.item ? opt.item(it) : '<span class="dd__t">' + it.t + '</span>') +
          '<svg class="dd__tick" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></li>';
      }).join('');
      none.hidden = shown.length > 0;
    }
    function sync() { var it = items.filter(function (x) { return x.v === sel.value; })[0] || items[0]; root.querySelector('.dd__v').innerHTML = opt.face ? opt.face(it) : it.t; }
    function setAct(i) {
      var lis = list.children; if (!lis.length) { act = -1; return; }
      act = Math.max(0, Math.min(lis.length - 1, i));
      [].forEach.call(lis, function (li, j) { li.classList.toggle('act', j === act); });
      (q || btn).setAttribute('aria-activedescendant', lis[act].id); lis[act].scrollIntoView({ block: 'nearest' });
    }
    function open() {
      closeAll(api); if (isOpen) return; isOpen = true;
      shown = items; if (q) q.value = ''; render();
      pop.hidden = false; root.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      // keep it on screen: flip up if there is no room below
      var r = pop.getBoundingClientRect(); root.classList.toggle('up', r.bottom > innerHeight - 8 && r.top - r.height - btn.offsetHeight > 70);
      requestAnimationFrame(function () { root.classList.add('in'); });
      setAct(Math.max(0, shown.findIndex(function (x) { return x.v === sel.value; })));
      if (q) q.focus({ preventScroll: true });
      openDD = api;
    }
    function close(refocus) {
      if (!isOpen) return; isOpen = false; root.classList.remove('in', 'open'); btn.setAttribute('aria-expanded', 'false'); btn.removeAttribute('aria-activedescendant');
      setTimeout(function () { if (!isOpen) pop.hidden = true; }, 180);
      if (openDD === api) openDD = null; if (refocus) btn.focus();
    }
    function choose(v) {
      if (sel.value !== v) { sel.value = v; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      sync(); close(true);
    }
    btn.addEventListener('click', function () { isOpen ? close(true) : open(); });
    list.addEventListener('click', function (e) { var li = e.target.closest('li'); if (li) choose(li.dataset.v); });
    list.addEventListener('mousemove', function (e) { var li = e.target.closest('li'); if (li) setAct([].indexOf.call(list.children, li)); });
    var typed = '', typedT;
    function keys(e) {
      var k = e.key;
      if (!isOpen) { if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') { e.preventDefault(); open(); } return; }
      if (k === 'ArrowDown') { e.preventDefault(); setAct(act + 1); }
      else if (k === 'ArrowUp') { e.preventDefault(); setAct(act - 1); }
      else if (k === 'Home') { e.preventDefault(); setAct(0); } else if (k === 'End') { e.preventDefault(); setAct(1e3); }
      else if (k === 'Enter' || (k === ' ' && !q)) { e.preventDefault(); if (act > -1 && list.children[act]) choose(list.children[act].dataset.v); }
      else if (k === 'Escape') { e.preventDefault(); close(true); }
      else if (k === 'Tab') close(false);
      else if (!q && k.length === 1) { typed += k.toLowerCase(); clearTimeout(typedT); typedT = setTimeout(function () { typed = ''; }, 600);
        var i = shown.findIndex(function (x) { return x.t.toLowerCase().indexOf(typed) === 0; }); if (i > -1) setAct(i); }
    }
    btn.addEventListener('keydown', keys); if (q) {
      q.addEventListener('keydown', keys);
      q.addEventListener('input', function () {
        var s = q.value.trim().toLowerCase().replace(/^\+/, '');
        shown = !s ? items : items.filter(function (it) { var c = CC[it.v]; return it.v.replace('+', '').indexOf(s) === 0 || (c && c.n.toLowerCase().indexOf(s) > -1); });
        render(); setAct(0);
      });
    }
    sel.addEventListener('change', sync); // e.g. nationality → country code
    var api = { root: root, close: close }; sync(); render();
    return api;
  }

  var NAT = { India: 'IN', UAE: 'AE', 'Sri Lanka': 'LK', Nepal: 'NP', Bangladesh: 'BD', Other: 'WORLD' };
  dropdown($('#f-level'), { cls: 'dd--prog' });
  dropdown($('#p-from'), { cls: 'dd--nat', face: function (it) { return flag(NAT[it.v]) + '<span>' + it.t + '</span>'; }, item: function (it) { return flag(NAT[it.v]) + '<span class="dd__t">' + it.t + '</span>'; } });
  dropdown(cc, { cls: 'dd--cc', search: true,
    face: function (it) { return flag(CC[it.v] ? CC[it.v].k : '') + '<span>' + it.v + '</span>'; },
    item: function (it) { var c = CC[it.v] || {}; return flag(c.k) + '<span class="dd__t">' + (c.n || it.v) + '</span><span class="dd__c">' + it.v + '</span>'; } });
  // a new country code re-checks the number and updates the example placeholder
  cc.addEventListener('change', function () { var r = CC[cc.value]; if (r) phone.placeholder = r.ex; if (phone.value) phone.dispatchEvent(new Event('input')); });

  /* ---------- WhatsApp contact panel ---------- */
  var wa = $('#wa'); if (!wa) return;
  var fab = wa.querySelector('.wa__fab'), panel = wa.querySelector('.wa__panel');
  if (!fab || !panel) return;
  function setWA(on) { wa.classList.toggle('open', on); fab.setAttribute('aria-expanded', on); panel.hidden = !on; if (on) setTimeout(function () { panel.querySelector('.wa__go').focus(); }, 60); }
  fab.addEventListener('click', function () { setWA(!wa.classList.contains('open')); });
  wa.querySelector('.wa__x').addEventListener('click', function () { setWA(false); fab.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && wa.classList.contains('open')) { setWA(false); fab.focus(); } });
  document.addEventListener('pointerdown', function (e) { if (wa.classList.contains('open') && !wa.contains(e.target)) setWA(false); });
  panel.querySelector('.wa__go').addEventListener('click', function () { setWA(false); });
})();
