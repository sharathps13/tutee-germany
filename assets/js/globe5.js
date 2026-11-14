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
  var NET = null;
  function net() {
    if (NET) return NET; var nodes = [], links = [], seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 110; i++) { var u = rnd() * 2 - 1, t = rnd() * 6.2832, r = Math.sqrt(1 - u * u); nodes.push([r * Math.cos(t) * 1.002, u * 1.002, r * Math.sin(t) * 1.002]); }
    for (var a = 0; a < nodes.length; a++) { var ds = []; for (var b = 0; b < nodes.length; b++) if (b !== a) { var dx = nodes[a][0] - nodes[b][0], dy = nodes[a][1] - nodes[b][1], dz = nodes[a][2] - nodes[b][2]; ds.push([dx * dx + dy * dy + dz * dz, b]); }
      ds.sort(function (x, y) { return x[0] - y[0]; }); for (var k = 0; k < 3; k++) if (ds[k][1] > a) links.push(a, ds[k][1]); }
    return (NET = { nodes: nodes, links: links });
  }
  function rimSprite(R) {
    var pad = Math.round(R * .12), w = Math.round(R * 2 + pad * 2), d = Math.min(window.devicePixelRatio || 1, 2), c = document.createElement('canvas'); c.width = c.height = w * d;
    var x = c.getContext('2d'); x.scale(d, d); var m = w / 2;
    var gl = x.createRadialGradient(m, m, R * .9, m, m, R + pad);
    gl.addColorStop(0, 'rgba(80,200,255,0)'); gl.addColorStop(.43, 'rgba(90,210,255,.6)'); gl.addColorStop(.55, 'rgba(70,180,255,.3)'); gl.addColorStop(.8, 'rgba(40,140,230,.08)'); gl.addColorStop(1, 'rgba(40,140,230,0)');
    x.fillStyle = gl; x.fillRect(0, 0, w, w);
    x.strokeStyle = 'rgba(200,245,255,.95)'; x.lineWidth = 1.6; x.beginPath(); x.arc(m, m, R, 0, 7); x.stroke();
    c.w = w; return c;
  }
  // builds a 1° land mask from the dot data, then returns fill points and coastline points
  var MESH = null;
  function landMesh() {
    if (MESH) return MESH; var raw = window.TC_LAND || [], W = 360, H = 180, m = new Uint8Array(W * H);
    var c = document.createElement('canvas'); c.width = W; c.height = H; var x = c.getContext('2d'); x.fillStyle = '#fff';
    for (var i = 0; i < raw.length; i += 2) { var la = raw[i] / 10, lo = raw[i + 1] / 10, rr = 1.5 / Math.max(.25, Math.cos(la * RAD)); x.beginPath(); x.ellipse(lo + 180, 90 - la, Math.min(6, rr), 1.5, 0, 0, 7); x.fill(); }
    var d = x.getImageData(0, 0, W, H).data; for (var j = 0; j < W * H; j++) m[j] = d[j * 4 + 3] > 110 ? 1 : 0;
    var fill = [], edge = [];
    function at(cxx, cyy) { if (cyy < 0 || cyy >= H) return 0; return m[cyy * W + ((cxx + W) % W)]; }
    for (var yy = 0; yy < H; yy++) {
      var lat = 90 - yy - .5, step = Math.max(1, Math.round(1 / Math.max(.15, Math.cos(lat * RAD))));
      for (var xx = 0; xx < W; xx++) {
        if (!at(xx, yy)) continue; var lon = xx - 180 + .5;
        var isEdge = !at(xx - 1, yy) || !at(xx + 1, yy) || !at(xx, yy - 1) || !at(xx, yy + 1);
        var v = vec(lat, lon);
        if (isEdge) { edge.push(v[0], v[1], v[2]); var v2 = vec(lat, lon + .5); edge.push(v2[0], v2[1], v2[2]); }
        else if (xx % (step * 2) === 0 && yy % 2 === 0) fill.push(v[0], v[1], v[2]);
      }
    }
    return (MESH = { fill: new Float32Array(fill), edge: new Float32Array(edge) });
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


  /* ---- v88 photoreal Earth: tiny raw-WebGL renderer (no library). Ray-sphere per pixel, NASA Blue Marble
     texture (public domain), soft day lighting, ocean glint, blue atmosphere + warm golden rim. ---- */
  var EARTH_TEX = 'assets/img/earth/earth-2k.jpg', EARTH_TEX_HD = 'assets/img/earth/earth-4k.jpg', EW = null;
  function earth() {
    if (EW !== null) return EW; EW = false;
    try {
      var c = document.createElement('canvas'), gl = c.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: false });
      if (!gl) return EW;
      var vs = 'attribute vec2 a;uniform float s;varying vec2 p;void main(){p=a*s;gl_Position=vec4(a,0.,1.);}';
      var fs = '#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\nuniform sampler2D T;uniform vec4 r;uniform float k;uniform vec2 g;uniform float px;varying vec2 p;' +
        'void main(){float d=length(p);vec3 L=normalize(vec3(-.5,.42,.76));' +
        'float at=exp(-max(d-1.,0.)*16.)*smoothstep(1.12,1.,d);vec3 ac=mix(vec3(.22,.55,1.),vec3(1.,.74,.38),smoothstep(.15,.95,p.x/max(d,.001))*.5);' +
        'vec4 halo=vec4(ac*at*.75,at*.75);' +
        'if(d>1.){gl_FragColor=halo;return;}' +
        'float Z=sqrt(max(0.,1.-d*d));vec3 n=vec3(p,Z);' +
        'float y=p.y*r.z+Z*r.w,zp=-p.y*r.w+Z*r.z,x=p.x*r.x-zp*r.y,z=p.x*r.y+zp*r.x;' +
        'vec2 uv=vec2(atan(x,z)/6.2831853+.5,.5-asin(clamp(y,-1.,1.))/3.1415927);' +
        'vec3 t=texture2D(T,uv).rgb;vec3 b=mix(vec3(.03,.09,.2),t,k);' +
        'float df=dot(n,L);float li=smoothstep(-.45,.85,df)*.98+.1;' +
        'float w=smoothstep(.03,.14,b.b-b.r)*k;vec3 H=normalize(L+vec3(0.,0.,1.));float sp=pow(max(dot(n,H),0.),48.)*.4*w;' +
        'vec3 col=b*li*vec3(.9,.98,1.12)+sp*vec3(.75,.88,1.);' +
        'float f=1.-Z;col+=vec3(.3,.6,1.)*pow(f,2.2)*.6;' +
        'col+=vec3(1.,.7,.32)*pow(f,3.)*smoothstep(-.1,.9,p.x)*.7;' +
        'vec2 q=p-(g-.5)*1.3;col+=vec3(.55,.78,1.)*exp(-dot(q,q)*3.)*.07;' +
        'float e=smoothstep(1.,1.-px*2.,d);gl_FragColor=vec4(col,1.)*e+halo*(1.-e);}';
      function sh(t, src) { var o = gl.createShader(t); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; }
      var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return EW; gl.useProgram(pr);
      var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      var al = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
      var tx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tx);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([8, 24, 52]));
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(function (k) { gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE); });
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      var U = {}; ['T', 'r', 'k', 'g', 's', 'px'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
      EW = { c: c, gl: gl, U: U, k: 0, ready: false, born: 0 };
      var im = new Image(); im.decoding = 'async';
      im.onload = function () { var up = function () { gl.bindTexture(gl.TEXTURE_2D, tx); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im); EW.ready = true; EW.born = performance.now(); if (window.__tcGlobe) window.__tcGlobe.loop(); }; (im.decode ? im.decode() : Promise.resolve()).then(up, up); }; // decode off the main thread before the GPU upload
      var gr = document.getElementById('globe'), gw = gr ? gr.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 2) : 0; // 4K only when the sphere is big enough on screen to show it
      im.src = (gl.getParameter(gl.MAX_TEXTURE_SIZE) >= 4096 && gw > 1100 && !LOWEND) ? EARTH_TEX_HD : EARTH_TEX;
    } catch (e) { EW = false; }
    return EW;
  }
  function earthDraw(G, size, pad) {
    var E = earth(); if (!E) return null; var gl = E.gl, c = E.c;
    if (c.width !== size) { c.width = c.height = size; }
    gl.viewport(0, 0, size, size);
    if (E.ready) E.k = Math.min(1, (performance.now() - E.born) / 700);
    gl.uniform1i(E.U.T, 0); gl.uniform4f(E.U.r, G.cl, G.sl, G.cp, G.sp); gl.uniform1f(E.U.k, E.k);
    gl.uniform2f(E.U.g, G.glint.x, 1 - G.glint.y); gl.uniform1f(E.U.s, pad); gl.uniform1f(E.U.px, pad * 2 / size);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return c;
  }
  function Globe(canvas, opt) {
    opt = opt || {}; var self = this;
    this.c = canvas; this.ctx = canvas.getContext('2d', { alpha: true });
    this.markers = (opt.markers || []).map(function (m) { return Object.assign({ v: vec(m.lat, m.lon), s: 1, a: 1 }, m); });
    this.hubs = (opt.hubs || []).map(function (m) { return Object.assign({ v: vec(m.lat, m.lon) }, m); });
    this.arcs = []; this.maxArcs = opt.maxArcs || 5; this.arcEvery = opt.arcEvery || 1600; this.lastArc = 0;
    this.base = opt.lon != null ? opt.lon : 40; this.baseLat = opt.lat != null ? opt.lat : 20;
    this.spin = opt.spin == null ? 0.006 : opt.spin;          // degrees per millisecond (≈ 1 turn / 2.7 min)
    this.speed = 1; this.steer = { x: 0, y: 0 }; this.off = { x: 0, y: 0 };
    this.hover = null; this.active = opt.active || null; this.focusT = null; this.visible = true;
    this.lon = this.base; this.lat = this.baseLat; this.t = 0;
    // drag / swipe to spin, with inertia
    this.vel = 0; this.drag = null; this.dragged = false; this.lastInput = 0; this.glint = { x: .3, y: .25 };
    canvas.style.touchAction = 'pan-y'; canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', function (e) { self.drag = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, moved: 0 }; self.dragged = false; self.vel = 0; self.loop(); });
    addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect(); if (r.width) { self.glint.x = (e.clientX - r.left) / r.width; self.glint.y = (e.clientY - r.top) / r.height; }
      var d = self.drag; if (!d || e.pointerId !== d.id) return;
      var dx = e.clientX - d.x, dy = e.clientY - d.y, now = performance.now(), dt = Math.max(1, now - d.t);
      d.moved += Math.abs(dx) + Math.abs(dy);
      if (d.moved > 6) { self.dragged = true; canvas.style.cursor = 'grabbing'; try { canvas.setPointerCapture(d.id); } catch (_) {} }
      var deg = 180 / (self.R * Math.PI);                               // px → degrees at the globe's scale
      self.base -= dx * deg; self.baseLat = Math.max(-55, Math.min(65, self.baseLat + dy * deg));
      self.vel = (-dx * deg) / dt; self.lastInput = now; d.x = e.clientX; d.y = e.clientY; d.t = now;
    }, { passive: true });
    function up(e) { if (!self.drag || (e && e.pointerId !== self.drag.id)) return; self.drag = null; canvas.style.cursor = 'grab'; setTimeout(function () { self.dragged = false; }, 50); }
    addEventListener('pointerup', up); addEventListener('pointercancel', up);
    sprites(); this.resize();
    new ResizeObserver(function () { self.resize(); }).observe(canvas);
    new IntersectionObserver(function (e) { self.visible = e[0].isIntersecting; if (self.visible) self.loop(); }, { rootMargin: '80px' }).observe(canvas);
    document.addEventListener('visibilitychange', function () { if (!document.hidden) self.loop(); });
    this.loop();
  }
  var P = Globe.prototype;
  P.resize = function () {
    var r = this.c.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, (navigator.deviceMemory && navigator.deviceMemory <= 2) ? 1.5 : 2);
    if (!r.width) return;
    if (this.c.width === Math.round(r.width * d) && this.c.height === Math.round(r.height * d) && this.w === r.width) return; // perf: no realloc when nothing changed
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
    // perf (v140): the WebGL Earth is its own layer under this canvas — no per-frame copy (drawImage of a WebGL canvas forces a GPU readback on many devices)
    var PAD = 1.12, dg = Math.min(window.devicePixelRatio || 1, LOWEND ? 1.5 : 2), ES = Math.min(LOWEND ? 1400 : 2048, Math.round(R * 2 * PAD * dg)), ec = earthDraw(this, ES, PAD);
    if (ec) {
      if (ec.parentNode !== this.c.parentNode) { ec.className = 'globe-gl'; ec.setAttribute('aria-hidden', 'true'); ec.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0'; this.c.parentNode.insertBefore(ec, this.c); }
      var gk = R + '|' + cx + '|' + cy + '|' + this.c.offsetLeft + '|' + this.c.offsetTop;
      if (this._gk !== gk) { this._gk = gk; var gs = R * 2 * PAD; ec.style.cssText = 'position:absolute;pointer-events:none;left:0;top:0;width:' + gs + 'px;height:' + gs + 'px;transform:translate(' + (this.c.offsetLeft + cx - R * PAD) + 'px,' + (this.c.offsetTop + cy - R * PAD) + 'px)'; }
    }
    else {
    // body: deep navy core with a cyan inner glow (holographic look)
    var g = ctx.createRadialGradient(cx - R * .25, cy - R * .3, R * .05, cx, cy, R);
    g.addColorStop(0, 'rgba(18,70,110,.55)'); g.addColorStop(.65, 'rgba(6,28,52,.55)'); g.addColorStop(.92, 'rgba(20,110,160,.35)'); g.addColorStop(1, 'rgba(90,200,255,.55)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
    // light follows the pointer across the sphere
    var gx = cx + (this.glint.x - .5) * R * 1.3, gy = cy + (this.glint.y - .5) * R * 1.3, gg = ctx.createRadialGradient(gx, gy, 0, gx, gy, R * .9);
    gg.addColorStop(0, 'rgba(140,230,255,.22)'); gg.addColorStop(1, 'rgba(140,230,255,0)');
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip(); ctx.fillStyle = gg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
    // scan line sweeping down the globe
    var sy = cy - R + ((this.t / 22) % (R * 2.6)) ; var sg = ctx.createLinearGradient(0, sy - 40, 0, sy + 40);
    sg.addColorStop(0, 'rgba(120,220,255,0)'); sg.addColorStop(.5, 'rgba(160,240,255,.10)'); sg.addColorStop(1, 'rgba(120,220,255,0)'); ctx.fillStyle = sg; ctx.fillRect(cx - R, sy - 40, R * 2, 80);
    ctx.restore();
    // network: fixed nodes on the sphere, linked to near neighbours, front side only
    var NW = net(), lnk = NW.links, nd = NW.nodes, pp = [];
    for (var ni = 0; ni < nd.length; ni++) pp.push(this.project(nd[ni]));
    ctx.lineWidth = .7; ctx.beginPath();
    for (var li = 0; li < lnk.length; li += 2) { var A = pp[lnk[li]], Bq = pp[lnk[li + 1]]; if (A[2] < .08 || Bq[2] < .08) continue; ctx.moveTo(A[0], A[1]); ctx.lineTo(Bq[0], Bq[1]); }
    ctx.strokeStyle = 'rgba(110,210,255,.16)'; ctx.stroke();
    ctx.fillStyle = 'rgba(150,230,255,.85)';
    for (var nj = 0; nj < pp.length; nj++) { var q0 = pp[nj]; if (q0[2] < .08) continue; ctx.globalAlpha = Math.min(1, q0[2] * 1.6); ctx.beginPath(); ctx.arc(q0[0], q0[1], 1.3 + q0[2] * .9, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    // land: dim filled continents + glowing coastlines (holographic map)
    var LM = landMesh(), cl = this.cl, sl = this.sl, cp = this.cp, sp = this.sp;
    function pass(arr, size, col, minZ) {
      var bk = [[], [], [], []];
      for (var i = 0; i < arr.length; i += 3) {
        var x = arr[i] * cl + arr[i + 2] * sl, z = -arr[i] * sl + arr[i + 2] * cl, y = arr[i + 1], zz = y * sp + z * cp;
        if (zz <= minZ) continue; bk[Math.min(3, (zz * 4) | 0)].push(cx + x * R, cy - (y * cp - z * sp) * R);
      }
      for (var q = 0; q < 4; q++) { var pts = bk[q]; if (!pts.length) continue; ctx.fillStyle = col(q); ctx.beginPath(); var hs = size / 2;
        for (var k = 0; k < pts.length; k += 2) ctx.rect(pts[k] - hs, pts[k + 1] - hs, size, size); ctx.fill(); }
    }
    var u = Math.max(1, R / 210);
    pass(LM.fill, 2.6 * u, function (q) { return 'rgba(30,110,200,' + (.16 + q * .09).toFixed(2) + ')'; }, 0);
    ctx.globalCompositeOperation = 'lighter';
    pass(LM.edge, 2.4 * u, function (q) { return 'rgba(60,170,255,' + (.10 + q * .06).toFixed(2) + ')'; }, .02);   // halo
    pass(LM.edge, 1.15 * u, function (q) { return 'rgba(170,235,255,' + (.35 + q * .18).toFixed(2) + ')'; }, .02); // crisp coast
    ctx.globalCompositeOperation = 'source-over';
    // bright cyan rim with glow (pre-rendered sprite, no per-frame blur)
    if (!this._rim || this._rimR !== R) { this._rimR = R; this._rim = rimSprite(R); }
    ctx.drawImage(this._rim, cx - this._rim.w / 2, cy - this._rim.w / 2, this._rim.w, this._rim.w);
    }
    // flight routes (v113): Chennai and Dubai → the active destination stay on screen as glowing arcs;
    // a light travels along each with a fading trail. Hovering another pin adds its route from Chennai.
    var self0 = this, routes = [], dest = null, hv = null;
    for (var mi = 0; mi < this.markers.length; mi++) { if (this.markers[mi].id === this.active) dest = this.markers[mi]; if (this.markers[mi].id === this.hover) hv = this.markers[mi]; }
    if (dest) for (var hb = 0; hb < this.hubs.length; hb++) routes.push({ a: this.hubs[hb].v, b: dest.v, ph: hb * .5, main: 1 });
    if (hv && hv !== dest && this.hubs[0]) routes.push({ a: this.hubs[0].v, b: hv.v, ph: .25, main: 0 });
    var arcPt = function (r, tt) { var v = slerp(r.a, r.b, tt), lift = 1 + Math.sin(tt * Math.PI) * .26; return self0.project([v[0] * lift, v[1] * lift, v[2] * lift]); };
    ctx.lineCap = 'round';
    for (var ri = 0; ri < routes.length; ri++) {
      var rt = routes[ri], N = 48, P0 = [];
      for (var q = 0; q <= N; q++) P0.push(arcPt(rt, q / N));
      // base arc: faint at the start city, bright at the destination; soft glow underneath
      for (var pass = 0; pass < 2; pass++) {
        for (var q2 = 1; q2 <= N; q2++) {
          var A = P0[q2 - 1], B = P0[q2]; if (A[2] < -.12 || B[2] < -.12) continue;
          var f = q2 / N, al = (rt.main ? .18 : .12) + f * (rt.main ? .5 : .35);
          ctx.strokeStyle = pass ? 'rgba(255,214,120,' + al.toFixed(3) + ')' : 'rgba(249,180,80,' + (al * .28).toFixed(3) + ')';
          ctx.lineWidth = pass ? 1.4 : 5; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke();
        }
      }
      // travelling light with a fading trail
      if (!reduce) {
        var cyc = ((this.t / 3400) + rt.ph) % 1, hd = Math.min(1, cyc * 1.15), tl = Math.max(0, hd - .22);
        for (var q3 = 0; q3 < 14; q3++) {
          var t1 = tl + (hd - tl) * q3 / 14, t2 = tl + (hd - tl) * (q3 + 1) / 14, C = arcPt(rt, t1), D = arcPt(rt, t2); if (C[2] < -.12 || D[2] < -.12) continue;
          ctx.strokeStyle = 'rgba(255,236,190,' + (((q3 + 1) / 14) * .95).toFixed(3) + ')'; ctx.lineWidth = .8 + (q3 / 14) * 1.8; ctx.beginPath(); ctx.moveTo(C[0], C[1]); ctx.lineTo(D[0], D[1]); ctx.stroke();
        }
        var H = arcPt(rt, hd); if (H[2] > -.12 && hd < 1) { var cg = ctx.createRadialGradient(H[0], H[1], 0, H[0], H[1], 10); cg.addColorStop(0, 'rgba(255,248,225,1)'); cg.addColorStop(.35, 'rgba(255,214,120,.55)'); cg.addColorStop(1, 'rgba(249,201,92,0)'); ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(H[0], H[1], 10, 0, 7); ctx.fill(); }
      }
    }
    ctx.lineCap = 'butt';
    // start cities pulse gently
    for (var hu = 0; hu < this.hubs.length; hu++) { var hq = this.project(this.hubs[hu].v); if (hq[2] < .05) continue; var pp = ((this.t / 2200) + hu * .5) % 1;
      ctx.globalAlpha = (1 - pp) * .7 * Math.min(1, hq[2] * 2.5); ctx.strokeStyle = '#ffd27a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(hq[0], hq[1], 4 + pp * 14, 0, 7); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // hubs (Chennai, Dubai)
    var S = SP;
    for (var u = 0; u < this.hubs.length; u++) { var hp = this.project(this.hubs[u].v); if (hp[2] > .05) { ctx.globalAlpha = Math.min(1, hp[2] * 2.5); ctx.drawImage(S.hub, hp[0] - 12, hp[1] - 12, 24, 24); } }
    // destination pins — back-to-front, hovered one last
    var list = [], hov = null;
    for (var m = 0; m < this.markers.length; m++) { var mk = this.markers[m], mp = this.project(mk.v); mk.p = mp; if (mp[2] > .02) { if (mk.id === this.hover) hov = mk; else list.push(mk); } }
    list.sort(function (A, Bm) { return A.p[2] - Bm.p[2]; }); if (hov) list.push(hov);
    var pulse = (Math.sin(this.t / 380) + 1) / 2;
    for (var bm = 0; bm < this.markers.length; bm++) { var BM = this.markers[bm]; if (BM.id !== this.active || !BM.p || BM.p[2] < .05) continue;
      for (var rr = 0; rr < 3; rr++) { var ph = ((this.t / 1800) + rr / 3) % 1; ctx.globalAlpha = (1 - ph) * .8 * Math.min(1, BM.p[2] * 3); ctx.strokeStyle = '#f47f42'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(BM.p[0], BM.p[1], 6 + ph * 34, (6 + ph * 34) * (.45 + .55 * BM.p[2]), 0, 0, 7); ctx.stroke(); }
      ctx.globalAlpha = 1; }
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
    // floating country labels (HUD style)
    ctx.font = '600 ' + Math.round(Math.max(10, R / 30)) + 'px Manrope, system-ui, sans-serif'; ctx.textBaseline = 'middle';
    var placed = [], order = list.slice().sort(function (a, b) { return (b.id === this.active) - (a.id === this.active); }.bind(this));
    for (var lb = 0; lb < order.length; lb++) { var LBm = order[lb]; if (!LBm.name || LBm.p[2] < .35) continue;
      var lx = LBm.p[0] + 12, ly = LBm.p[1] - 22 * LBm.s, clash = false;
      for (var pq = 0; pq < placed.length; pq++) if (Math.abs(placed[pq][0] - lx) < 95 && Math.abs(placed[pq][1] - ly) < 20) { clash = true; break; }
      if (clash && LBm.id !== this.active) continue; placed.push([lx, ly]);
      ctx.globalAlpha = Math.min(1, (LBm.p[2] - .35) * 4) * (LBm.id === this.active || LBm.id === this.hover ? 1 : .78);
      ctx.fillStyle = 'rgba(2,12,24,.55)'; var tw = ctx.measureText(LBm.name).width; ctx.fillRect(lx - 4, ly - 9, tw + 8, 18);
      ctx.fillStyle = LBm.id === this.active ? '#ffb27a' : '#e6f6ff'; ctx.fillText(LBm.name, lx, ly); }
    ctx.globalAlpha = 1;
  };
  P.loop = function () {
    if (this._raf) return; var self = this, prev = performance.now();
    function step(now) {
      self._raf = null; if (!self.visible || document.hidden) return;
      var busy = now - scrolling < 160, minGap = (busy || LOWEND) && !self.drag ? 31 : 0; // keeps turning while scrolling, at 30fps
      if (now - prev < minGap) { prev = now - 16; self._raf = requestAnimationFrame(step); return; }
      var dt = Math.min(48, now - prev); prev = now; self.t = now;
      var k = 1 - Math.exp(-dt / 220), kf = 1 - Math.exp(-dt / 90);       // time-based easing factors
      self.speed += ((self.hover || self.focusT ? 0 : 1) - self.speed) * k;   // hover / focus → globe settles
      if (!self.drag) {
        if (Math.abs(self.vel) > .0004) { self.base += self.vel * dt; self.vel *= Math.pow(.94, dt / 16); }   // inertia after a fling
        else if (!reduce) self.base += self.spin * dt * self.speed;
      }
      self.off.x += (self.steer.x * 16 - self.off.x) * k; self.off.y += (self.steer.y * -10 - self.off.y) * k;
      if (self.focusT) { self.lon += (self.focusT.lon - self.lon) * k; self.lat += (self.focusT.lat - self.lat) * k; }
      else { self.lon = self.base + self.off.x; self.lat += (self.baseLat + self.off.y - self.lat) * k; }
      for (var i = 0; i < self.markers.length; i++) {
        var m = self.markers[i], on = m.id === self.hover;
        m.s += ((on ? 1.35 : 1) - m.s) * kf; m.a += ((self.hover && !on ? .35 : 1) - m.a) * kf;
      }
      self.draw();
      self._raf = requestAnimationFrame(step);
    }
    this._raf = requestAnimationFrame(step);
  };
  window.TCGlobe = Globe;
})();
