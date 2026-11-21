'use strict';
// PetPad's spaceships: six original designs drawn in code on a 2D canvas, nose up, origin at the middle of the hull.
// The launch form lets you pick one; the coin page shows it; a short lift-off scene plays after a launch.
// This file runs in the browser (window.Ships) and in Node (the server only needs the list of ids).
(function (root) {
  var SHIPS = [
    { id: 'comet', name: 'Comet', tag: 'Sleek and fast. Built to arrive first.' },
    { id: 'nova', name: 'Nova', tag: 'The classic. Nothing fancy, never fails.' },
    { id: 'orbiter', name: 'Orbiter', tag: 'A winged shuttle with twin boosters.' },
    { id: 'saucer', name: 'Saucer', tag: 'No flame, just a hum and a glow.' },
    { id: 'falcon', name: 'Falcon', tag: 'A heavy lifter with three engines.' },
    { id: 'pod', name: 'Pod', tag: 'Small, round and surprisingly quick.' },
  ];
  var ids = SHIPS.map(function (s) { return s.id; });
  var HULLS = [['Frost', '#e8ecff'], ['Ember', '#ff8a4a'], ['Void', '#4a4f72'], ['Solar', '#ffd24a'], ['Jade', '#4fd1a0'], ['Rose', '#ff7aa8'], ['Ocean', '#4a8bff'], ['Ivory', '#f3e9d2']];
  var ACCENTS = [['Cyan', '#4de3ff'], ['Magenta', '#ff4fd8'], ['Violet', '#9d7bff'], ['Amber', '#ffb02e'], ['Lime', '#9be83a'], ['Red', '#ff4d5d'], ['White', '#ffffff'], ['Teal', '#1fd1b8']];
  var SUITS = [['White', '#e9ecf6'], ['Orange', '#ff7a2e'], ['Gold', '#f2c230'], ['Green', '#3f8a5a'], ['Blue', '#3a6ad0'], ['Violet', '#5b3fd0'], ['Red', '#c8383f'], ['Black', '#22222c']];
  if (typeof window === 'undefined') { root.SHIPS = SHIPS; root.HULLS = HULLS; root.ACCENTS = ACCENTS; root.SUITS = SUITS; root.isShip = function (v) { return ids.indexOf(v) >= 0; }; return; }

  var CY = '#4de3ff', VI = '#9d7bff', MG = '#ff4fd8', AM = '#ffd98a';
  function hex(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgb(a) { return 'rgb(' + Math.round(a[0]) + ',' + Math.round(a[1]) + ',' + Math.round(a[2]) + ')'; }
  function mixc(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  // the colours the launcher picks: indexes into these lists (the server only accepts a value from the list)
  var K = null;
  function setK(look) {
    look = look || {}; var h = hex(root.Ships.HULLS[look.hull | 0] ? root.Ships.HULLS[look.hull | 0][1] : '#e8ecff'), a = hex(root.Ships.ACCENTS[look.accent | 0] ? root.Ships.ACCENTS[look.accent | 0][1] : '#4de3ff');
    K = { l: rgb(mixc(h, [255, 255, 255], 0.55)), m: rgb(h), d: rgb(mixc(h, [20, 24, 60], 0.38)), a: rgb(a), a2: rgb(mixc(a, [20, 24, 60], 0.32)) };
  }
  function lg(ctx, x0, y0, x1, y1, stops) { var g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
  function flame(ctx, x, y, w, len, t, hot) {
    var l = len * (0.85 + 0.15 * Math.sin(t * 38 + x)), g = ctx.createLinearGradient(0, y, 0, y + l);
    g.addColorStop(0, 'rgba(255,248,220,1)'); g.addColorStop(0.35, hot || 'rgba(255,170,90,.9)'); g.addColorStop(1, 'rgba(255,79,216,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w, y); ctx.quadraticCurveTo(x, y + l * 1.15, x + w, y); ctx.fill();
  }
  function win(ctx, x, y, r, col) { ctx.fillStyle = '#0a0d22'; ctx.beginPath(); ctx.arc(x, y, r + 2, 0, 7); ctx.fill(); ctx.fillStyle = col || CY; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.3, 0, 7); ctx.fill(); }
  function body(ctx, x0, x1) { return lg(ctx, x0, 0, x1, 0, [[0, K.d], [0.5, K.l], [1, K.d]]); }

  var DRAW = {
    comet: function (ctx, f, t) {
      if (f > 0) flame(ctx, 0, 50, 9, 30 + f * 90, t, 'rgba(120,230,255,.95)');
      ctx.fillStyle = body(ctx, -14, 14); ctx.beginPath(); ctx.moveTo(0, -118); ctx.bezierCurveTo(16, -70, 18, -10, 12, 50); ctx.lineTo(-12, 50); ctx.bezierCurveTo(-18, -10, -16, -70, 0, -118); ctx.fill();
      ctx.fillStyle = K.a; ctx.beginPath(); ctx.moveTo(-12, 8); ctx.lineTo(-44, 58); ctx.lineTo(-12, 44); ctx.fill(); ctx.beginPath(); ctx.moveTo(12, 8); ctx.lineTo(44, 58); ctx.lineTo(12, 44); ctx.fill();
      ctx.fillStyle = K.a2; ctx.fillRect(-2, 18, 4, 30); win(ctx, 0, -62, 7);
    },
    nova: function (ctx, f, t) {
      if (f > 0) flame(ctx, 0, 40, 13, 34 + f * 90, t);
      ctx.fillStyle = K.a; ctx.beginPath(); ctx.moveTo(-24, 10); ctx.lineTo(-50, 54); ctx.lineTo(-24, 40); ctx.fill(); ctx.beginPath(); ctx.moveTo(24, 10); ctx.lineTo(50, 54); ctx.lineTo(24, 40); ctx.fill();
      ctx.fillStyle = body(ctx, -26, 26); ctx.beginPath(); ctx.moveTo(0, -104); ctx.quadraticCurveTo(32, -60, 25, 42); ctx.lineTo(-25, 42); ctx.quadraticCurveTo(-32, -60, 0, -104); ctx.fill();
      ctx.fillStyle = K.a; ctx.beginPath(); ctx.moveTo(0, -104); ctx.quadraticCurveTo(13, -84, 15, -54); ctx.lineTo(-15, -54); ctx.quadraticCurveTo(-13, -84, 0, -104); ctx.fill();
      win(ctx, 0, -34, 9); ctx.fillStyle = K.a2; ctx.fillRect(-25, 28, 50, 5);
    },
    orbiter: function (ctx, f, t) {
      if (f > 0) { flame(ctx, -34, 46, 7, 26 + f * 70, t); flame(ctx, 34, 46, 7, 26 + f * 70, t); flame(ctx, 0, 52, 10, 30 + f * 80, t); }
      ctx.fillStyle = K.a; [-34, 34].forEach(function (x) { ctx.beginPath(); ctx.moveTo(x, -70); ctx.quadraticCurveTo(x + 9, -62, x + 8, 44); ctx.lineTo(x - 8, 44); ctx.quadraticCurveTo(x - 9, -62, x, -70); ctx.fill(); });
      ctx.fillStyle = K.l; ctx.beginPath(); ctx.moveTo(-20, 20); ctx.lineTo(-56, 54); ctx.lineTo(-20, 48); ctx.fill(); ctx.beginPath(); ctx.moveTo(20, 20); ctx.lineTo(56, 54); ctx.lineTo(20, 48); ctx.fill();
      ctx.fillStyle = body(ctx, -20, 20); ctx.beginPath(); ctx.moveTo(0, -108); ctx.quadraticCurveTo(24, -70, 20, 50); ctx.lineTo(-20, 50); ctx.quadraticCurveTo(-24, -70, 0, -108); ctx.fill();
      ctx.fillStyle = '#2a2e4a'; ctx.beginPath(); ctx.moveTo(0, -108); ctx.quadraticCurveTo(10, -92, 11, -76); ctx.lineTo(-11, -76); ctx.quadraticCurveTo(-10, -92, 0, -108); ctx.fill(); ctx.fillStyle = K.a2; ctx.fillRect(-20, 34, 40, 4); win(ctx, 0, -60, 7, AM);
    },
    saucer: function (ctx, f, t) {
      if (f > 0) { var g = ctx.createLinearGradient(0, 14, 0, 14 + 60 + f * 90); g.addColorStop(0, 'rgba(120,255,220,.55)'); g.addColorStop(1, 'rgba(120,255,220,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-26, 14); ctx.lineTo(26, 14); ctx.lineTo(54 + f * 24, 74 + f * 90); ctx.lineTo(-54 - f * 24, 74 + f * 90); ctx.fill(); }
      ctx.fillStyle = 'rgba(77,227,255,.35)'; ctx.beginPath(); ctx.ellipse(0, -18, 26, 28, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -18, 26, 28, 0, Math.PI, 0); ctx.stroke();
      ctx.fillStyle = lg(ctx, 0, -6, 0, 24, [[0, K.l], [1, K.d]]); ctx.beginPath(); ctx.ellipse(0, 4, 64, 20, 0, 0, 7); ctx.fill();
      ctx.fillStyle = K.a2; ctx.beginPath(); ctx.ellipse(0, 10, 64, 10, 0, 0, Math.PI); ctx.fill();
      for (var i = -3; i <= 3; i++) { ctx.fillStyle = (i + 3) % 2 ? K.a : '#ffffff'; ctx.beginPath(); ctx.arc(i * 17, 8 + Math.abs(i) * 0.6, 3.4, 0, 7); ctx.fill(); }
    },
    falcon: function (ctx, f, t) {
      if (f > 0) { flame(ctx, -30, 52, 8, 28 + f * 80, t); flame(ctx, 0, 56, 11, 34 + f * 96, t); flame(ctx, 30, 52, 8, 28 + f * 80, t); }
      [-30, 30].forEach(function (x) { ctx.fillStyle = K.m; ctx.beginPath(); ctx.moveTo(x, -44); ctx.quadraticCurveTo(x + 12, -36, x + 10, 52); ctx.lineTo(x - 10, 52); ctx.quadraticCurveTo(x - 12, -36, x, -44); ctx.fill(); ctx.fillStyle = K.a; ctx.fillRect(x - 10, -2, 20, 5); });
      ctx.fillStyle = body(ctx, -20, 20); ctx.beginPath(); ctx.moveTo(0, -112); ctx.quadraticCurveTo(24, -76, 20, 54); ctx.lineTo(-20, 54); ctx.quadraticCurveTo(-24, -76, 0, -112); ctx.fill();
      ctx.fillStyle = '#2a2e4a'; ctx.fillRect(-20, 24, 40, 6); ctx.fillStyle = K.a; ctx.fillRect(-20, 34, 40, 4); win(ctx, 0, -68, 8, K.a);
    },
    pod: function (ctx, f, t) {
      if (f > 0) { flame(ctx, -16, 40, 6, 20 + f * 60, t); flame(ctx, 16, 40, 6, 20 + f * 60, t); }
      ctx.fillStyle = K.a; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-50, 42); ctx.lineTo(-24, 34); ctx.fill(); ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(50, 42); ctx.lineTo(24, 34); ctx.fill();
      ctx.fillStyle = lg(ctx, -34, -30, 34, 40, [[0, K.l], [1, K.d]]); ctx.beginPath(); ctx.moveTo(0, -78); ctx.bezierCurveTo(44, -50, 40, 30, 26, 42); ctx.lineTo(-26, 42); ctx.bezierCurveTo(-40, 30, -44, -50, 0, -78); ctx.fill();
      ctx.fillStyle = K.a2; ctx.fillRect(-27, 32, 54, 6); win(ctx, 0, -40, 12); ctx.fillStyle = K.a; ctx.beginPath(); ctx.arc(0, -68, 3.4, 0, 7); ctx.fill();
    },
  };
  // where the coin's logo sits on each hull: [x, y, radius]
  var EMB = { comet: [0, -24, 9], nova: [0, 8, 14], orbiter: [0, -16, 13], saucer: [0, -8, 14], falcon: [0, -28, 13], pod: [0, 14, 14] };
  function emblem(ctx, id, im) {
    var e = EMB[id] || EMB.nova; if (!im || !im.complete || !im.naturalWidth) return;
    ctx.save(); ctx.beginPath(); ctx.arc(e[0], e[1], e[2], 0, 7); ctx.clip(); ctx.drawImage(im, e[0] - e[2], e[1] - e[2], e[2] * 2, e[2] * 2); ctx.restore();
    ctx.lineWidth = 2.2; ctx.strokeStyle = '#0a0d22'; ctx.beginPath(); ctx.arc(e[0], e[1], e[2] + 1, 0, 7); ctx.stroke(); ctx.lineWidth = 1.2; ctx.strokeStyle = K.a; ctx.beginPath(); ctx.arc(e[0], e[1], e[2] + 2.6, 0, 7); ctx.stroke();
  }

  // draw one ship centred on (x, y); fire is 0 to 1
  function draw(ctx, id, x, y, scale, fire, t, look, logo) {
    var f = DRAW[id] || DRAW.nova; setK(look); ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); f(ctx, fire || 0, t || 0); emblem(ctx, DRAW[id] ? id : 'nova', logo); ctx.restore();
  }
  function thumb(cv, id, look, logo) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || 96, h = cv.clientHeight || 96;
    cv.width = w * dpr; cv.height = h * dpr; var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    var g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w * 0.6); g.addColorStop(0, 'rgba(157,123,255,.25)'); g.addColorStop(1, 'rgba(157,123,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    draw(ctx, id, w / 2, h / 2 - 2, Math.min(w, h) / 230, 0, 0, look, logo);
  }

  // the lift-off scene: a full-screen canvas with the chosen ship, a countdown, a flame and the pilot's portrait
  function liftoff(cv, id, faceSrc, label, done, look, logo) {
    var ctx = cv.getContext('2d'), face = new Image(), t0 = 0, raf = 0, stop = false, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    face.src = faceSrc || '';
    var rnd = function (i) { var s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); };
    function size() { W = cv.clientWidth || window.innerWidth; H = cv.clientHeight || window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; }
    size();
    function frame(ts) {
      if (stop) return; if (!t0) t0 = ts; var e = (ts - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#03040c'); bg.addColorStop(1, '#14103a'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      var lift = e < 3 ? 0 : Math.min(1, (e - 3) / 3), up = lift * lift * (H + 420);
      for (var i = 0; i < 90; i++) { var sy = (rnd(i + 1) * H + up * (0.15 + rnd(i + 7) * 0.5)) % H, sx = rnd(i + 40) * W; ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + rnd(i + 3) * 0.6) + ')'; ctx.fillRect(sx, sy, 1.5, 1.5 + lift * 10 * rnd(i + 9)); }
      var pad = H * 0.82; ctx.fillStyle = '#0a0d22'; ctx.fillRect(W / 2 - 150, pad, 300, H - pad); ctx.fillStyle = 'rgba(157,123,255,.7)'; ctx.fillRect(W / 2 - 150, pad, 300, 2);
      var shake = e > 2 && e < 3.6 ? Math.sin(e * 90) * 1.6 : 0, sc = Math.min(1.7, H / 480), sy2 = pad - 48 * sc - up, fire = e < 1.5 ? 0 : Math.min(1, (e - 1.5) / 2);
      if (fire > 0) { var gl = ctx.createRadialGradient(W / 2, pad, 4, W / 2, pad, 160 * sc); gl.addColorStop(0, 'rgba(255,170,100,' + 0.35 * fire * (1 - lift) + ')'); gl.addColorStop(1, 'rgba(255,170,100,0)'); ctx.fillStyle = gl; ctx.fillRect(0, pad - 160 * sc, W, 320 * sc); }
      draw(ctx, id, W / 2 + shake, sy2, sc, fire, e, look, logo);
      ctx.textAlign = 'center'; ctx.fillStyle = '#4de3ff'; ctx.font = '500 22px "JetBrains Mono", monospace';
      ctx.fillText(e < 3 ? 'T-' + String(Math.max(0, 3 - Math.floor(e))).padStart(2, '0') : (lift < 1 ? 'LIFTOFF' : 'IN ORBIT'), W / 2, 56);
      ctx.fillStyle = '#eef2ff'; ctx.font = '600 18px Inter, sans-serif'; ctx.fillText(label || '', W / 2, 88);
      if (face.complete && face.naturalWidth) { var r = 40, fx = Math.max(60, W / 2 - 250), fy = 150; ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, r, 0, 7); ctx.clip(); ctx.drawImage(face, fx - r, fy - r, r * 2, r * 2); ctx.restore(); ctx.lineWidth = 4; ctx.strokeStyle = '#4de3ff'; ctx.beginPath(); ctx.arc(fx, fy, r + 2, 0, 7); ctx.stroke(); }
      if (e > 7.2) { stop = true; if (done) done(); return; }
      raf = window.requestAnimationFrame(frame);
    }
    raf = window.requestAnimationFrame(frame);
    return { stop: function () { stop = true; window.cancelAnimationFrame(raf); } };
  }
  root.Ships = { list: SHIPS, HULLS: HULLS, ACCENTS: ACCENTS, SUITS: SUITS, draw: draw, thumb: thumb, liftoff: liftoff, isShip: function (v) { return ids.indexOf(v) >= 0; } };
})(typeof window !== 'undefined' ? window : module.exports);
