'use strict';
// PetPaws's moving backdrops, plain 2D canvas, in a cosy shelter style: a dusk sky, drifting clouds, hills, little hearts and paw prints.
// GridBg is the quiet scene behind the pages; GridIntro is the loading-screen style intro with the shelter, four pets in round frames
// and a ride that rolls to a new home. Both stop when the page is hidden and respect reduced motion. Everything is original art drawn in code.
(function (root) {
  var AMBER = '#ffc46b', CORAL = '#ff8a7a', ROSE = '#ff6f8a', CREAM = '#fff4de';
  var reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.caveReduce = reduce;

  var LOGS = ['> shelter doors are open', '> every pet fed and brushed', '> treats: stocked', '> pick a pet', '> hold to open the gate, release to wait'];

  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var DOTS = (function () { var r = rng(20260), a = [], i; for (i = 0; i < 40; i++) a.push({ x: r() * 1280, y: r() * 720, z: 0.3 + r() * 0.9, p: r() * 6.28, k: r() < 0.5 ? 0 : 1 }); return a; })();

  function sizeCanvas(cv) {
    var dpr = Math.min(root.devicePixelRatio || 1, 2), w = cv.clientWidth || root.innerWidth, h = cv.clientHeight || root.innerHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w: w, h: h, dpr: dpr };
  }
  function loop(self, fps, draw) {
    var last = 0, raf = 0, on = false;
    function tick(t) { if (!on) return; raf = root.requestAnimationFrame(tick); if (t - last < 1000 / fps) return; last = t; draw(t / 1000); }
    self.start = function () { if (on) return; on = true; raf = root.requestAnimationFrame(tick); };
    self.stop = function () { on = false; root.cancelAnimationFrame(raf); };
    root.document.addEventListener('visibilitychange', function () { if (root.document.hidden) { if (on) root.cancelAnimationFrame(raf); } else if (on) { raf = root.requestAnimationFrame(tick); } });
  }
  function glow(ctx, x, y, r, rgb, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
  function heart(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s * 0.4); ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.5, y - s * 1.1, x, y - s * 0.5); ctx.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s, y - s * 0.4, x, y + s * 0.4); ctx.fill(); }
  function paw(ctx, x, y, s) { ctx.beginPath(); ctx.ellipse(x, y + s * 0.3, s, s * 0.8, 0, 0, 7); ctx.fill(); [[-1.1, -0.9], [-0.4, -1.5], [0.4, -1.5], [1.1, -0.9]].forEach(function (d) { ctx.beginPath(); ctx.ellipse(x + d[0] * s, y + d[1] * s, s * 0.34, s * 0.42, 0, 0, 7); ctx.fill(); }); }

  // ---- scenery, all on the 1280 x 720 board ----
  function sky(ctx, W, H, dim) {
    var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#241a36'); g.addColorStop(0.5, '#6a3a58'); g.addColorStop(0.85, '#c8686a'); g.addColorStop(1, '#f0a070');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (dim) { ctx.fillStyle = 'rgba(27,18,32,' + dim + ')'; ctx.fillRect(0, 0, W, H); }
  }
  function clouds(ctx, t) {
    ctx.fillStyle = 'rgba(255,225,208,.2)';
    for (var i = 0; i < 5; i++) { var x = ((i * 300 + t * 6) % 1500) - 110, y = 90 + (i % 3) * 90; ctx.beginPath(); ctx.ellipse(x, y, 110, 22, 0, 0, 7); ctx.ellipse(x + 55, y - 14, 64, 20, 0, 0, 7); ctx.ellipse(x - 58, y - 8, 56, 17, 0, 0, 7); ctx.fill(); }
  }
  function sun(ctx) { glow(ctx, 980, 470, 320, '255,200,140', 0.5); glow(ctx, 980, 470, 110, '255,236,190', 0.8); ctx.fillStyle = '#ffeabd'; ctx.beginPath(); ctx.arc(980, 470, 52, 0, 7); ctx.fill(); }
  function hills(ctx, ground) {
    ctx.fillStyle = '#6a3f58'; ctx.beginPath(); ctx.moveTo(0, ground - 30); ctx.quadraticCurveTo(260, ground - 150, 560, ground - 40); ctx.quadraticCurveTo(900, ground - 170, 1280, ground - 50); ctx.lineTo(1280, 720); ctx.lineTo(0, 720); ctx.fill();
    ctx.fillStyle = '#4a2c48'; ctx.beginPath(); ctx.moveTo(0, ground + 10); ctx.quadraticCurveTo(360, ground - 70, 760, ground + 8); ctx.quadraticCurveTo(1040, ground - 40, 1280, ground + 6); ctx.lineTo(1280, 720); ctx.lineTo(0, 720); ctx.fill();
  }
  function floaters(ctx, t, drift) {
    for (var i = 0; i < DOTS.length; i++) {
      var d = DOTS[i], y = 760 - ((d.y + t * 14 * d.z * drift) % 820), x = d.x + Math.sin(t * 0.5 + d.p) * 14;
      ctx.globalAlpha = 0.1 + 0.18 * d.z * (0.6 + 0.4 * Math.sin(t + d.p)); ctx.fillStyle = d.k ? '#ff8aa0' : '#ffe9c8';
      if (d.k) heart(ctx, x, y, 8 + d.z * 8); else paw(ctx, x, y, 5 + d.z * 5);
    }
    ctx.globalAlpha = 1;
  }
  function building(ctx, x, ground, s, wall, roof, lit) {
    ctx.fillStyle = wall; ctx.fillRect(x - 70 * s, ground - 100 * s, 140 * s, 100 * s); ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 86 * s, ground - 100 * s); ctx.lineTo(x, ground - 160 * s); ctx.lineTo(x + 86 * s, ground - 100 * s); ctx.fill();
    ctx.fillStyle = '#3a2a40'; ctx.fillRect(x - 16 * s, ground - 54 * s, 32 * s, 54 * s);
    ctx.fillStyle = lit ? '#ffe08a' : '#5a4a50'; ctx.fillRect(x - 56 * s, ground - 76 * s, 28 * s, 26 * s); ctx.fillRect(x + 28 * s, ground - 76 * s, 28 * s, 26 * s);
    ctx.fillStyle = '#ff8aa0'; heart(ctx, x, ground - 108 * s, 13 * s);
  }
  function fence(ctx, ground, x0, x1) { ctx.fillStyle = '#e8d2b0'; for (var f = x0; f < x1; f += 34) ctx.fillRect(f, ground + 4, 7, 30); ctx.fillRect(x0, ground + 12, x1 - x0, 4); ctx.fillRect(x0, ground + 24, x1 - x0, 4); }

  // ---- the quiet backdrop: dusk sky, drifting clouds, hills and floating hearts and paw prints ----
  function GridBg(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), self = this, fps = o.fps || 10;
    function draw(t) {
      sizeCanvas(cv); var W = cv.width, H = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      sky(ctx, W, H, 0.1);
      var sc = Math.max(W / 1280, H / 720);
      ctx.setTransform(sc, 0, 0, sc, (W - 1280 * sc) * 0.5, (H - 720 * sc) * 0.5);
      sun(ctx); clouds(ctx, t); hills(ctx, 560); floaters(ctx, t, 1);
    }
    loop(self, fps, draw);
    if (reduce) { self.start = function () { draw(0); }; }
  }

  // ---- the intro: the shelter on the left, a house on the right, four pets in round frames and a ride that rolls between them ----
  function GridIntro(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), self = this, faces = o.faces || [], t0 = 0;
    function draw(t) {
      if (!t0) t0 = t;
      var e = t - t0;
      sizeCanvas(cv); var W = cv.width, H = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      sky(ctx, W, H, 0);
      var sc = Math.max(W / 1280, H / 720), ox = (W - 1280 * sc) * 0.5, oy = (H - 720 * sc) * 0.5;
      ctx.setTransform(sc, 0, 0, sc, ox, oy);
      sun(ctx); clouds(ctx, e); hills(ctx, 560); floaters(ctx, e, 1.4);
      ctx.fillStyle = '#3c2a46'; ctx.fillRect(0, 600, 1280, 120); ctx.fillStyle = 'rgba(255,230,190,.35)'; for (var d = 0; d < 11; d++) ctx.fillRect(d * 120 + 20, 650, 70, 5);
      building(ctx, 180, 600, 1.3, '#8a6070', '#b07058', true); building(ctx, 1130, 600, 0.95, '#c28a62', '#d65a4a', e % 14 > 8);
      fence(ctx, 560, 20, 330);
      // the ride: waits, rolls to the house, then goes back
      var cycle = 14, c = e % cycle, go = c < 3 ? 0 : (c < 9 ? (c - 3) / 6 : 1), ease = go * go * (3 - 2 * go), x = 330 + (1000 - 330) * ease;
      if (root.Ships && root.Ships.draw) root.Ships.draw(ctx, 'van', x, 560, 1.5, go > 0 && go < 1 ? 1 : 0, e, { hull: 0, accent: 0 }, null, faces[0]);
      if (c > 9 && c < 13) { ctx.fillStyle = '#ff8aa0'; for (var k = 0; k < 6; k++) { var q = ((c - 9) * 0.5 + k * 0.17) % 1; ctx.globalAlpha = 1 - q; heart(ctx, 1090 + k * 16, 420 - q * 70, 12); } ctx.globalAlpha = 1; }
      ctx.fillStyle = AMBER; ctx.font = '500 22px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText(c < 3 ? 'READY…' : (c < 9 ? 'ON THE WAY…' : 'ADOPTED!'), 640, 60);
      ctx.textAlign = 'left';
      // four pets in round frames
      var xs = [520, 660, 800, 940], ys = [180, 130, 190, 140];
      ctx.imageSmoothingEnabled = true;
      xs.forEach(function (x, i) {
        var im = faces[i], w = 118, bob = Math.sin(e * 0.9 + i) * 4, cx = x, cy = ys[i] + bob;
        ctx.save();
        glow(ctx, cx, cy, w * 0.95, i % 2 ? '255,111,138' : '255,196,107', 0.25);
        ctx.beginPath(); ctx.arc(cx, cy, w / 2, 0, 7); ctx.fillStyle = '#4a3550'; ctx.fill(); ctx.clip();
        if (im && im.complete && im.naturalWidth) ctx.drawImage(im, cx - w / 2, cy - w / 2, w, w);
        ctx.restore();
        ctx.lineWidth = 6; ctx.strokeStyle = i % 2 ? ROSE : AMBER; ctx.beginPath(); ctx.arc(cx, cy, w / 2 + 2, 0, 7); ctx.stroke();
        ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(cx, cy, w / 2 + 9, 0, 7); ctx.stroke();
      });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var v = ctx.createRadialGradient(W * 0.55, H * 0.5, Math.min(W, H) * 0.35, W * 0.55, H * 0.5, Math.max(W, H) * 0.9); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(27,18,32,.55)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }
    loop(self, o.fps || 30, draw);
    if (reduce) { self.start = function () { draw(0); }; }
  }
  GridIntro.LOGS = LOGS;
  GridIntro.create = function (cv, o) { return new GridIntro(cv, o); };

  root.GridBg = GridBg; root.GridIntro = GridIntro;
})(window);
