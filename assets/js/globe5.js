/* Tutee Connect — destination globe (v6).
   Canvas 2D, no dependencies. Performance notes:
   - land dots are batched into a few alpha buckets → ~6 fill() calls per frame instead of ~2,300
   - marker pins and glows are pre-rendered sprites (drawImage, no shadowBlur per frame)
   - rotation, cursor steer and hover use time-based easing, so motion is frame-rate independent
   - device pixel ratio capped at 1.75; loop pauses off-screen or in a hidden tab */
(function () {
  // perf: weaker devices get a lighter globe; every device redraws at half rate while the page is scrolling
  var LOWEND = (navigator.hardwareConcurrency || 4) <= 4 || matchMedia('(pointer:coarse)').matches || (navigator.deviceMemory || 8) <= 4;
  var scrolling = 0; addEventListener('scroll', function () { scrolling = performance.now(); }, { passive: true });
  'use strict';
  var RAD = Math.PI / 180, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function vec(lat, lon) { var p = lat * RAD, l = lon * RAD, c = Math.cos(p); return [c * Math.sin(l), Math.sin(p), c * Math.cos(l)]; }
  function slerp(a, b, t) {
    var d = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))); if (d < 1e-6) return a;
    var s = Math.sin(d), k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  }
  var LAND = null;
  function land() {
    if (LAND) return LAND; var raw = window.TC_LAND || [], out = new Float32Array(raw.length / 2 * 3);
    for (var i = 0, j = 0; i < raw.length; i += 2, j += 3) { var v = vec(raw[i] / 10, raw[i + 1] / 10); out[j] = v[0]; out[j + 1] = v[1]; out[j + 2] = v[2]; }
    return (LAND = out);
  }
  // ---- sprites -------------------------------------------------------------
  function sprite(size, draw) { var c = document.createElement('canvas'), d = 2; c.width = c.height = size * d; var x = c.getContext('2d'); x.scale(d, d); draw(x, size); return c; }
  function pin(color, glow) {
    return sprite(56, function (x, s) {
      var cx = s / 2, cy = s / 2;
      var g = x.createRadialGradient(cx, cy + 6, 0, cx, cy + 6, 22); g.addColorStop(0, glow); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.beginPath(); x.arc(cx, cy + 6, 22, 0, 7); x.fill();
      // teardrop pin: tip at (cx, cy+12), head centred at (cx, cy)
      x.beginPath(); x.moveTo(cx, cy + 12);
      x.bezierCurveTo(cx - 3, cy + 7, cx - 7, cy + 4, cx - 7, cy - 1); x.arc(cx, cy - 1, 7, Math.PI, 0); x.bezierCurveTo(cx + 7, cy + 4, cx + 3, cy + 7, cx, cy + 12);
      x.fillStyle = color; x.fill(); x.lineWidth = 1; x.strokeStyle = 'rgba(2,8,10,.55)'; x.stroke();
      x.beginPath(); x.arc(cx, cy - 1, 2.6, 0, 7); x.fillStyle = '#071a1a'; x.fill();
    });
  }
  var SP = null;
  function sprites() {
    if (SP) return SP;
    return (SP = {
      gold: pin('#f9c95c', 'rgba(249,201,92,.45)'),
      orange: pin('#f47f42', 'rgba(244,127,66,.6)'),
      hub: sprite(24, function (x, s) { var c = s / 2; var g = x.createRadialGradient(c, c, 0, c, c, 11); g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); x.fillStyle = '#fff'; x.beginPath(); x.arc(c, c, 3, 0, 7); x.fill(); })
    });
  }

  function Globe(canvas, opt) {
    opt = opt || {}; var self = this;
    this.c = canvas; this.ctx = canvas.getContext('2d', { alpha: true });
    this.markers = (opt.markers || []).map(function (m) { return Object.assign({ v: vec(m.lat, m.lon), s: 1, a: 1 }, m); });
    this.hubs = (opt.hubs || []).map(function (m) { return Object.assign({ v: vec(m.lat, m.lon) }, m); });
    this.arcs = []; this.maxArcs = opt.maxArcs || 5; this.arcEvery = opt.arcEvery || 1600; this.lastArc = 0;
    this.base = opt.lon != null ? opt.lon : 40; this.baseLat = opt.lat != null ? opt.lat : 20;
    this.spin = opt.spin == null ? 0.0022 : opt.spin;          // degrees per millisecond (≈ 1 turn / 2.7 min)
    this.speed = 1; this.steer = { x: 0, y: 0 }; this.off = { x: 0, y: 0 };
    this.hover = null; this.active = opt.active || null; this.focusT = null; this.visible = true;
    this.lon = this.base; this.lat = this.baseLat; this.t = 0;
    sprites(); this.resize();
    new ResizeObserver(function () { self.resize(); }).observe(canvas);
    new IntersectionObserver(function (e) { self.visible = e[0].isIntersecting; if (self.visible) self.loop(); }, { rootMargin: '80px' }).observe(canvas);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) self.loop(); });
    this.loop();
  }
  var P = Globe.prototype;
  P.resize = function () {
    var r = this.c.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, LOWEND ? 1.25 : 1.75);
    if (!r.width) return;
    this.w = r.width; this.h = r.height; this.c.width = Math.round(r.width * d); this.c.height = Math.round(r.height * d);
    this.ctx.setTransform(d, 0, 0, d, 0, 0); this.R = Math.min(this.w, this.h) * 0.44; this.dot = Math.max(1.1, this.R / 230);
    this.draw();
  };
  P.setSteer = function (x, y) { this.steer.x = x; this.steer.y = y; };
  P.setHover = function (id) { this.hover = id; };
  P.focus = function (lat, lon) { var d = ((lon - this.lon + 540) % 360) - 180; this.focusT = { lat: lat * .8, lon: this.lon + d }; };
  P.release = function () { this.base = this.lon - this.off.x; this.focusT = null; };
  P.arcTo = function (id) {
    var to = this.markers.filter(function (m) { return m.id === id; })[0]; if (!to || !this.hubs[0]) return;
    this.arcs.push({ a: this.hubs[0].v, b: to.v, t: 0 }); if (this.arcs.length > this.maxArcs) this.arcs.shift();
  };
  P._rot = function () { var a = -this.lon * RAD, b = this.lat * RAD; this.cl = Math.cos(a); this.sl = Math.sin(a); this.cp = Math.cos(b); this.sp = Math.sin(b); };
  P.project = function (v) {
    var x = v[0] * this.cl + v[2] * this.sl, z = -v[0] * this.sl + v[2] * this.cl, y = v[1];
    return [this.w / 2 + x * this.R, this.h / 2 - (y * this.cp - z * this.sp) * this.R, y * this.sp + z * this.cp];
  };
  P.draw = function () {
    var ctx = this.ctx, R = this.R, cx = this.w / 2, cy = this.h / 2; if (!R) return;
    this._rot(); ctx.clearRect(0, 0, this.w, this.h);
    // body + rim
    var g = ctx.createRadialGradient(cx - R * .35, cy - R * .4, R * .1, cx, cy, R);
    g.addColorStop(0, 'rgba(42,106,102,.42)'); g.addColorStop(.7, 'rgba(18,58,58,.30)'); g.addColorStop(1, 'rgba(7,26,26,.15)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(249,201,92,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R + .5, 0, 7); ctx.stroke();
    // land dots — 6 alpha buckets, one fill each
    var L = land(), s = this.dot, h = s * .8, B = [[], [], [], [], [], []];
    var cl = this.cl, sl = this.sl, cp = this.cp, sp = this.sp;
    for (var i = 0; i < L.length; i += 3) {
      var x = L[i] * cl + L[i + 2] * sl, z = -L[i] * sl + L[i + 2] * cl, y = L[i + 1], zz = y * sp + z * cp;
      if (zz <= 0) continue;
      B[Math.min(5, (zz * 6) | 0)].push(cx + x * R, cy - (y * cp - z * sp) * R);
    }
    for (var b = 0; b < 6; b++) {
      var pts = B[b]; if (!pts.length) continue;
      ctx.fillStyle = 'rgba(214,226,224,' + (0.2 + b * 0.12).toFixed(2) + ')'; ctx.beginPath();
      for (var k = 0; k < pts.length; k += 2) ctx.rect(pts[k] - h, pts[k + 1] - h, s * 1.6, s * 1.6);
      ctx.fill();
    }
    // flight arcs
    for (var a = 0; a < this.arcs.length; a++) {
      var arc = this.arcs[a], head = Math.min(1, arc.t), tail = Math.max(0, arc.t - .9); if (tail >= 1) continue;
      ctx.beginPath(); var on = false, last = null;
      for (var q = 0; q <= 36; q++) {
        var tt = tail + (head - tail) * q / 36, v = slerp(arc.a, arc.b, tt), lift = 1 + Math.sin(tt * Math.PI) * .16;
        var p = this.project([v[0] * lift, v[1] * lift, v[2] * lift]);
        if (p[2] < -.15) { on = false; continue; }
        if (!on) { ctx.moveTo(p[0], p[1]); on = true; } else ctx.lineTo(p[0], p[1]); last = p;
      }
      ctx.strokeStyle = 'rgba(249,201,92,' + (.8 * (1 - tail)).toFixed(2) + ')'; ctx.lineWidth = 1.4; ctx.stroke();
      if (last && head < 1) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(last[0], last[1], 2, 0, 7); ctx.fill(); }
    }
    // hubs (Chennai, Dubai)
    var S = SP;
    for (var u = 0; u < this.hubs.length; u++) { var hp = this.project(this.hubs[u].v); if (hp[2] > .05) { ctx.globalAlpha = Math.min(1, hp[2] * 2.5); ctx.drawImage(S.hub, hp[0] - 12, hp[1] - 12, 24, 24); } }
    // destination pins — back-to-front, hovered one last
    var list = [], hov = null;
    for (var m = 0; m < this.markers.length; m++) { var mk = this.markers[m], mp = this.project(mk.v); mk.p = mp; if (mp[2] > .02) { if (mk.id === this.hover) hov = mk; else list.push(mk); } }
    list.sort(function (A, Bm) { return A.p[2] - Bm.p[2]; }); if (hov) list.push(hov);
    var pulse = (Math.sin(this.t / 380) + 1) / 2;
    for (var n = 0; n < list.length; n++) {
      var M = list[n], sc = M.s, sz = 28 * sc, edge = Math.min(1, M.p[2] * 3);
      ctx.globalAlpha = edge * M.a;
      if (M.id === this.hover) {
        ctx.strokeStyle = 'rgba(244,127,66,' + (.55 - pulse * .4).toFixed(2) + ')'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(M.p[0], M.p[1], 9 + pulse * 9, 0, 7); ctx.stroke();
        ctx.strokeStyle = 'rgba(244,127,66,.9)'; ctx.beginPath(); ctx.arc(M.p[0], M.p[1], 6, 0, 7); ctx.stroke();
      }
      var spr = (M.id === this.hover || M.id === this.active) ? S.orange : S.gold;
      // sprite tip sits 12px below centre at scale 1 → anchor the tip on the location
      ctx.drawImage(spr, M.p[0] - sz, M.p[1] - sz - 12 * sc, sz * 2, sz * 2);
    }
    ctx.globalAlpha = 1;
  };
  P.loop = function () {
    if (this._raf) return; var self = this, prev = performance.now();
    function step(now) {
      self._raf = null; if (!self.visible || document.hidden) return;
      var busy = now - scrolling < 160, minGap = busy ? 1e9 : (LOWEND ? 31 : 0); // frozen mid-scroll, resumes when the page settles
      if (now - prev < minGap) { prev = now - 16; self._raf = requestAnimationFrame(step); return; }
      var dt = Math.min(48, now - prev); prev = now; self.t = now;
      var k = 1 - Math.exp(-dt / 220), kf = 1 - Math.exp(-dt / 90);       // time-based easing factors
      self.speed += ((self.hover || self.focusT ? 0 : 1) - self.speed) * k;   // hover / focus → globe settles
      if (!reduce) self.base += self.spin * dt * self.speed;
      self.off.x += (self.steer.x * 16 - self.off.x) * k; self.off.y += (self.steer.y * -10 - self.off.y) * k;
      if (self.focusT) { self.lon += (self.focusT.lon - self.lon) * k; self.lat += (self.focusT.lat - self.lat) * k; }
      else { self.lon = self.base + self.off.x; self.lat += (self.baseLat + self.off.y - self.lat) * k; }
      for (var i = 0; i < self.markers.length; i++) {
        var m = self.markers[i], on = m.id === self.hover;
        m.s += ((on ? 1.35 : 1) - m.s) * kf; m.a += ((self.hover && !on ? .35 : 1) - m.a) * kf;
      }
      if (!reduce && now - self.lastArc > self.arcEvery && self.hubs.length) {
        self.lastArc = now; var de = self.markers.filter(function (x) { return x.id === self.active; })[0];
        var to = de && Math.random() < .5 ? de : self.markers[(Math.random() * self.markers.length) | 0];
        self.arcs.push({ a: self.hubs[(Math.random() * self.hubs.length) | 0].v, b: to.v, t: 0 }); if (self.arcs.length > self.maxArcs) self.arcs.shift();
      }
      for (var a = 0; a < self.arcs.length; a++) self.arcs[a].t += dt / 2600;
      self.draw();
      self._raf = requestAnimationFrame(step);
    }
    this._raf = requestAnimationFrame(step);
  };
  window.TCGlobe = Globe;
})();
