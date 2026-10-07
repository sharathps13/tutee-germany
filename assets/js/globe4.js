/* Tutee Connect — lightweight canvas globe (no dependencies, ~5 KB).
   Orthographic projection of a dotted land mask, destination markers and
   animated great-circle flight paths. Pauses when off-screen or tab hidden. */
(function () {
  'use strict';
  var RAD = Math.PI / 180;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function vec(lat, lon) {
    var p = lat * RAD, l = lon * RAD, c = Math.cos(p);
    return [c * Math.sin(l), Math.sin(p), c * Math.cos(l)];
  }
  function slerp(a, b, t) {
    var d = Math.acos(Math.max(-1, Math.min(1, a[0]*b[0]+a[1]*b[1]+a[2]*b[2])));
    if (d < 1e-6) return a;
    var s = Math.sin(d), k1 = Math.sin((1-t)*d)/s, k2 = Math.sin(t*d)/s;
    return [a[0]*k1+b[0]*k2, a[1]*k1+b[1]*k2, a[2]*k1+b[2]*k2];
  }

  var LAND = null;
  function land() {
    if (LAND) return LAND;
    var raw = window.TC_LAND || [], out = new Float32Array(raw.length / 2 * 3);
    for (var i = 0, j = 0; i < raw.length; i += 2, j += 3) {
      var v = vec(raw[i] / 10, raw[i+1] / 10);
      out[j] = v[0]; out[j+1] = v[1]; out[j+2] = v[2];
    }
    return (LAND = out);
  }

  function Globe(canvas, opt) {
    opt = opt || {};
    this.c = canvas; this.ctx = canvas.getContext('2d');
    this.markers = (opt.markers || []).map(function (m) { return Object.assign({ v: vec(m.lat, m.lon) }, m); });
    this.hubs = (opt.hubs || []).map(function (m) { return Object.assign({ v: vec(m.lat, m.lon) }, m); });
    this.arcs = [];
    this.lon = opt.lon != null ? opt.lon : -60; this.lat = opt.lat != null ? opt.lat : 18;
    this.tLon = this.lon; this.tLat = this.lat;
    this.spin = opt.spin == null ? 0.05 : opt.spin;
    this.dotColor = opt.dotColor || 'rgba(214,226,224,';
    this.active = null; this.visible = true; this.t = 0; this.drag = null; this.focusing = false;
    this.arcEvery = opt.arcEvery || 1400; this.lastArc = 0; this.maxArcs = opt.maxArcs || 5;
    this.resize(); var self = this;
    this._ro = new ResizeObserver(function () { self.resize(); }); this._ro.observe(canvas);
    new IntersectionObserver(function (e) { self.visible = e[0].isIntersecting; if (self.visible) self.loop(); }, { rootMargin: '100px' }).observe(canvas);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) self.loop(); });
    this.steer = {x:0,y:0};
    this.loop();
  }
  Globe.prototype.resize = function () {
    var r = this.c.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
    this.w = r.width; this.h = r.height; this.c.width = r.width * d; this.c.height = r.height * d;
    this.ctx.setTransform(d, 0, 0, d, 0, 0); this.R = Math.min(this.w, this.h) * 0.42; this.draw();
  };
  Globe.prototype.bindDrag = function () {
    var self = this, c = this.c;
    c.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return; // keep vertical page scroll on touch
      self.drag = { x: e.clientX, y: e.clientY, lon: self.lon, lat: self.lat }; c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', function (e) {
      if (!self.drag) return;
      self.lon = self.tLon = self.drag.lon - (e.clientX - self.drag.x) * 0.3;
      self.lat = self.tLat = Math.max(-60, Math.min(60, self.drag.lat + (e.clientY - self.drag.y) * 0.3));
      self.focusing = false;
    });
    c.addEventListener('pointerup', function () { self.drag = null; });
  };
  Globe.prototype.focus = function (lat, lon, id) {
    var d = ((lon - this.lon + 540) % 360) - 180; // shortest way round
    this.tLon = this.lon + d; this.tLat = Math.max(-40, Math.min(50, lat * 0.8));
    this.active = id || null; this.focusing = true;
    if (reduce) { this.lon = this.tLon; this.lat = this.tLat; this.draw(); }
  };
  Globe.prototype.addArc = function (from, to) {
    this.arcs.push({ a: from.v, b: to.v, t: 0 });
    if (this.arcs.length > this.maxArcs) this.arcs.shift();
  };
  Globe.prototype.project = function (v) {
    var cl = Math.cos(-this.lon * RAD), sl = Math.sin(-this.lon * RAD);
    var x = v[0]*cl + v[2]*sl, z = -v[0]*sl + v[2]*cl, y = v[1];
    var cp = Math.cos(this.lat * RAD), sp = Math.sin(this.lat * RAD);
    var y2 = y*cp - z*sp, z2 = y*sp + z*cp;
    return [this.w/2 + x*this.R, this.h/2 - y2*this.R, z2];
  };
  Globe.prototype.draw = function () {
    var ctx = this.ctx, R = this.R, cx = this.w/2, cy = this.h/2;
    if (!R) return;
    ctx.clearRect(0, 0, this.w, this.h);
    // sphere body + rim light
    var g = ctx.createRadialGradient(cx - R*.35, cy - R*.4, R*.1, cx, cy, R);
    g.addColorStop(0, 'rgba(42,106,102,.42)'); g.addColorStop(.7, 'rgba(18,58,58,.30)'); g.addColorStop(1, 'rgba(7,26,26,.15)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(245,199,126,.22)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R + .5, 0, 7); ctx.stroke();
    // land dots
    var L = land(), s = Math.max(1, R / 210);
    for (var i = 0; i < L.length; i += 3) {
      var p = this.project([L[i], L[i+1], L[i+2]]);
      if (p[2] <= 0) continue;
      ctx.fillStyle = this.dotColor + (0.18 + p[2] * 0.62).toFixed(2) + ')';
      ctx.fillRect(p[0] - s*.8, p[1] - s*.8, s*1.6, s*1.6);
    }
    // arcs
    for (var a = 0; a < this.arcs.length; a++) {
      var arc = this.arcs[a], head = Math.min(1, arc.t), tail = Math.max(0, arc.t - 0.9);
      if (tail >= 1) continue;
      ctx.beginPath(); var started = false, last = null;
      for (var k = 0; k <= 40; k++) {
        var tt = tail + (head - tail) * k / 40, v = slerp(arc.a, arc.b, tt), lift = 1 + Math.sin(tt * Math.PI) * 0.18;
        var q = this.project([v[0]*lift, v[1]*lift, v[2]*lift]);
        if (q[2] < -0.15) { started = false; continue; }
        if (!started) { ctx.moveTo(q[0], q[1]); started = true; } else ctx.lineTo(q[0], q[1]);
        last = q;
      }
      var grad = 'rgba(249,201,92,' + (0.85 * (1 - tail)).toFixed(2) + ')';
      ctx.strokeStyle = grad; ctx.lineWidth = 1.6; ctx.stroke();
      if (last && head < 1) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(last[0], last[1], 2.2, 0, 7); ctx.fill(); }
    }
    // markers
    var pulse = (Math.sin(this.t / 400) + 1) / 2, all = this.hubs.concat(this.markers);
    for (var m = 0; m < all.length; m++) {
      var mk = all[m], q2 = this.project(mk.v); if (q2[2] <= 0.02) continue;
      var on = mk.id && mk.id === this.active, hub = this.hubs.indexOf(mk) > -1;
      var col = hub ? '#f9c95c' : on ? '#f47f42' : '#fbf8f2', r0 = on ? 5 : hub ? 4 : 3;
      ctx.globalAlpha = Math.min(1, q2[2] * 2);
      if (on || hub) { ctx.strokeStyle = 'rgba(249,201,92,' + (0.6 - pulse*.5) + ')'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(q2[0], q2[1], r0 + 4 + pulse * 8, 0, 7); ctx.stroke(); }
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q2[0], q2[1], r0, 0, 7); ctx.fill();
      if ((on || hub) && mk.label) {
        ctx.font = '600 11px Manrope, sans-serif'; ctx.fillStyle = 'rgba(251,248,242,.92)';
        ctx.fillText(mk.label, q2[0] + 9, q2[1] + 4);
      }
      ctx.globalAlpha = 1;
    }
  };
  Globe.prototype.loop = function () {
    if (this._raf) return; var self = this, prev = performance.now();
    function step(now) {
      self._raf = null;
      if (!self.visible || document.hidden) return;
      var dt = Math.min(50, now - prev); prev = now; self.t = now;
      if (!self.drag) {
        self.lat += ((18 + self.steer.y * -22) - self.lat) * 0.04;
        if (self.focusing) {
          self.lon += (self.tLon - self.lon) * 0.06; self.lat += (self.tLat - self.lat) * 0.06;
          if (Math.abs(self.tLon - self.lon) < .05 && Math.abs(self.tLat - self.lat) < .05) self.focusing = false;
        } else if (!reduce) { self.lon += self.spin * dt / 16 + self.steer.x * 0.35; }
      }
      if (self.hubs.length && self.markers.length && now - self.lastArc > self.arcEvery && !reduce) {
        self.lastArc = now;
        var de = self.markers.filter(function (m) { return m.id === self.active; })[0];
        self.addArc(self.hubs[Math.random() * self.hubs.length | 0], de && Math.random() < .55 ? de : self.markers[Math.random() * self.markers.length | 0]);
      }
      for (var i = 0; i < self.arcs.length; i++) self.arcs[i].t += dt / 2200;
      self.draw();
      if (!reduce || self.focusing) self._raf = requestAnimationFrame(step);
    }
    this._raf = requestAnimationFrame(step);
  };
  Globe.prototype.arcTo = function (id) {
    var to = this.markers.filter(function (m) { return m.id === id; })[0];
    if (to && this.hubs[0]) { this.addArc(this.hubs[0], to); if (this.hubs[1]) this.addArc(this.hubs[1], to); }
  };
  window.TCGlobe = Globe;
})();
