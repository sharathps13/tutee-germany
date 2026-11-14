/* Murmuration over the CTA band — a starling flock rolls over the clouds, every few
   seconds converges into "GERMANY", holds, and scatters. The pointer is a hawk the
   flock tears open around. Vanilla port of 21st.dev "Murmuration Wordmark":
   transparent sky (the cloud photo shows through), no reeds, light ink. */
(function () {
  var frame = document.getElementById('band');
  if (!frame || !window.requestAnimationFrame) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var WORD = 'GERMANY', INK = '243,227,200', FLY = 2.5, FORM = 1.5, HOLD = 3.6, REL = 0.8;
  var lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;

  function rnd(seed) { var a = seed >>> 0 || 1; return function () { a = (a + 0x6d2b79f5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function curl(x, y, t) {
    var a = 1.7 * x + t, b = 1.3 * y - .6 * t, c = 2.9 * y + 1.1 * x - .8 * t, d = 4.3 * x - 3.7 * y + 1.3 * t;
    var dx = 1.7 * Math.cos(a) * Math.cos(b) + .66 * Math.cos(c) - 1.505 * Math.sin(d);
    var dy = -1.3 * Math.sin(a) * Math.sin(b) + 1.74 * Math.cos(c) + 1.295 * Math.sin(d);
    return [dy, -dx];
  }
  function ease(k) { k = k < 0 ? 0 : k > 1 ? 1 : k; return k * k * (3 - 2 * k); }

  var cv = document.createElement('canvas');
  cv.className = 'band__flock'; cv.setAttribute('aria-hidden', 'true');
  frame.insertBefore(cv, frame.querySelector('.wrap'));
  var ctx = cv.getContext('2d'); if (!ctx) return;

  var w = 1, h = 1, dpr = 1, n = 0, raf = 0, on = false, last = 0, clock = 1.5, hx = -1e5, hy = -1e5;
  var px, py, vx, vy, dep, ph, tg, tx = new Float32Array(0), ty = new Float32Array(0), R = rnd(11);

  function layout() {
    var r = frame.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width)); h = Math.max(1, Math.round(r.height));
    dpr = Math.min(window.devicePixelRatio || 1, lowEnd ? 1 : 1.25);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    // sample the word into points, in the band above the headline
    var m = document.createElement('canvas'); m.width = w; m.height = h;
    var mc = m.getContext('2d', { willReadFrequently: true }), pts = [];
    var fam = '800 100px Manrope, "Helvetica Neue", Arial, sans-serif';
    mc.font = fam; var ww = mc.measureText(WORD).width || 1;
    var size = Math.min((w * (w < 700 ? .84 : .46) / ww) * 100, h * .15 / .72);
    mc.font = fam.replace('100px', size + 'px'); mc.textAlign = 'center'; mc.textBaseline = 'middle';
    mc.fillText(WORD, w / 2, h * (w < 700 ? .1 : .13));
    var img = mc.getImageData(0, 0, w, h).data, step = Math.max(2, Math.round(Math.sqrt(w * h / 160000) * 2));
    for (var y = 0; y < h * .3; y += step) for (var x = 0; x < w; x += step)
      if (img[(y * w + x) * 4 + 3] > 128) pts.push(x + (R() - .5) * step, y + (R() - .5) * step);
    tx = new Float32Array(pts.length / 2); ty = new Float32Array(pts.length / 2);
    for (var i = 0; i < tx.length; i++) { tx[i] = pts[2 * i]; ty[i] = pts[2 * i + 1]; }
    var want = Math.round((lowEnd ? 1100 : 2600) * Math.min(1, Math.max(.35, w * h / (1440 * 860))));
    if (want !== n) {
      n = want; px = new Float32Array(n); py = new Float32Array(n); vx = new Float32Array(n); vy = new Float32Array(n);
      dep = new Float32Array(n); ph = new Float32Array(n);
      for (i = 0; i < n; i++) { var a = R() * 6.283, rr = Math.sqrt(R()); px[i] = w * .5 + Math.cos(a) * rr * w * .22; py[i] = h * .3 + Math.sin(a) * rr * h * .14; dep[i] = .55 + R() * .45; ph[i] = R() * 6.283; }
    }
    // shuffle targets so the word fills in from everywhere at once
    var o = new Int32Array(tx.length); for (i = 0; i < o.length; i++) o[i] = i;
    var sr = rnd(23); for (i = o.length - 1; i > 0; i--) { var j = Math.floor(sr() * (i + 1)), t = o[i]; o[i] = o[j]; o[j] = t; }
    tg = new Int32Array(n); for (i = 0; i < n; i++) tg[i] = o.length ? o[i % o.length] : -1;
  }

  function tick(now) {
    raf = on ? requestAnimationFrame(tick) : 0;
    var dt = Math.min(.05, (now - last) / 1000); last = now; clock += dt;
    var cyc = FLY + FORM + HOLD + REL, tc = clock % cyc, pull = 0;
    if (tc > FLY && tc <= FLY + FORM) pull = ease((tc - FLY) / FORM);
    else if (tc > FLY + FORM && tc <= FLY + FORM + HOLD) pull = 1;
    else if (tc > FLY + FORM + HOLD) pull = 1 - ease((tc - FLY - FORM - HOLD) / REL);
    var u = Math.min(w, h), cx = w / 2 + (.42 * Math.sin(clock * .21) + .12 * Math.sin(clock * .53 + 1)) * w * .5,
      cy = h * .3 + (.12 * Math.sin(clock * .33 + 2) - .06) * h, t = clock * .35, free = 1 - pull, hr = u * .16, hawk = hx > -1e4;
    for (var i = 0; i < n; i++) {
      var x = px[i], y = py[i], c = curl((x - w / 2) / u * 2.2 + dep[i] * .25, (y - h / 2) / u * 2.2, t);
      var ax = c[0] * 420 * free, ay = c[1] * 420 * free, dX = cx - x, dY = (cy - y) * 1.6, dC = Math.sqrt(dX * dX + dY * dY) / u;
      var hold = dC < .14 ? .15 : .15 + (dC - .14) * 6;
      ax += dX * hold * 2.2 * free; ay += dY * hold * 1.6 * free;
      var k = tg[i];
      if (pull > 0 && k >= 0) { ax += (tx[k] - x) * 9 * pull - vx[i] * 3.2 * pull; ay += (ty[k] - y) * 9 * pull - vy[i] * 3.2 * pull; }
      if (hawk) { var ex = x - hx, ey = y - hy, d2 = ex * ex + ey * ey; if (d2 < hr * hr) { var d = Math.sqrt(d2) + .01, f = (1 - d / hr) * 5200; ax += ex / d * f; ay += ey / d * f; } }
      var nx = (vx[i] + ax * dt) * (1 - 1.1 * dt), ny = (vy[i] + ay * dt) * (1 - 1.1 * dt), sp = Math.sqrt(nx * nx + ny * ny), cap = 520 + 380 * pull;
      if (sp > cap) { nx = nx / sp * cap; ny = ny / sp * cap; }
      vx[i] = nx; vy[i] = ny; px[i] = x + nx * dt; py[i] = y + ny * dt; ph[i] += dt * (9 + sp * .02);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    for (var pass = 0; pass < 2; pass++) {
      ctx.beginPath();
      for (i = 0; i < n; i++) {
        if ((pass === 1) !== (dep[i] > .78)) continue;
        var s = (1.5 + dep[i] * 2) * (1 - .35 * pull), v = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i]) + .001,
          ux = vx[i] / v, uy = vy[i] / v, fl = .55 + .45 * Math.sin(ph[i]), bx = px[i], by = py[i];
        var wx = -ux * s, wy = -uy * s, qx = -uy * s * fl, qy = ux * s * fl;
        ctx.moveTo(bx + wx + qx, by + wy + qy); ctx.lineTo(bx, by); ctx.lineTo(bx + wx - qx, by + wy - qy);
      }
      ctx.strokeStyle = 'rgba(' + INK + ',' + (pass ? .85 : .45) + ')'; ctx.lineWidth = pass ? 1.2 : .85; ctx.stroke();
    }
  }

  function start() { if (on) return; on = true; last = performance.now(); raf = requestAnimationFrame(tick); }
  function stop() { on = false; if (raf) cancelAnimationFrame(raf); raf = 0; }

  frame.addEventListener('pointermove', function (e) { var b = cv.getBoundingClientRect(); hx = e.clientX - b.left; hy = e.clientY - b.top; }, { passive: true });
  frame.addEventListener('pointerleave', function () { hx = hy = -1e5; });
  // perf (v140): build the flock only when the section comes near the screen, not during page load
  var built = false, lay = function () { if (built) layout(); };
  var rt; if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(lay, 150); }).observe(frame);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lay);
  if (window.IntersectionObserver) new IntersectionObserver(function (es) { if (es[0].isIntersecting) { if (!built) { built = true; layout(); } start(); } else stop(); }, { rootMargin: '300px' }).observe(frame);
  else { built = true; layout(); start(); }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else { var b = frame.getBoundingClientRect(); if (b.bottom > 0 && b.top < innerHeight) start(); } });
})();
