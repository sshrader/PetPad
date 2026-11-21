'use strict';
// PetPad's moving backdrops, plain 2D canvas, in a deep-space style: a Milky Way band, nebula glow, a ringed planet, a gas giant,
// drifting stars and shooting stars. GridBg is the quiet scene behind the pages; GridIntro is the loading-screen style intro with a
// countdown, four pilots in portholes and a rocket that lifts off when it reaches zero.
// Both stop when the page is hidden and respect reduced motion. Everything here is original art drawn in code.
(function (root) {
  var CYAN = '#4de3ff', VIOLET = '#9d7bff', MAGENTA = '#ff4fd8', AMBER = '#ffd98a';
  var reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.caveReduce = reduce;

  var LOGS = ['> T-minus 10 and counting', '> all stations report go', '> fuel: 100%', '> course set for the Milky Way', '> pick a pilot', '> hold to fuel, release to launch'];

  // a small seeded generator so the sky is the same on every frame
  function rng(seed) { var s = seed >>> 0; return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  var STARS = (function () {
    var r = rng(20260), a = [], i;
    for (i = 0; i < 260; i++) a.push({ x: r() * 1280, y: r() * 720, z: 0.3 + r() * 0.9, p: r() * 6.28, hue: r() });
    // a denser dusting along the diagonal of the Milky Way
    for (i = 0; i < 420; i++) { var u = r(), off = (r() + r() + r() - 1.5) * 150; a.push({ x: u * 1380 - 50 - off * 0.5, y: 120 + u * 500 + off, z: 0.2 + r() * 0.5, p: r() * 6.28, hue: r() }); }
    return a;
  })();

  function sizeCanvas(cv) {
    var dpr = Math.min(root.devicePixelRatio || 1, 2), w = cv.clientWidth || root.innerWidth, h = cv.clientHeight || root.innerHeight;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    return { w: w, h: h, dpr: dpr };
  }
  function loop(self, fps, draw) {
    var last = 0, raf = 0, on = false;
    function tick(t) {
      if (!on) return;
      raf = root.requestAnimationFrame(tick);
      if (t - last < 1000 / fps) return;
      last = t;
      draw(t / 1000);
    }
    self.start = function () { if (on) return; on = true; raf = root.requestAnimationFrame(tick); };
    self.stop = function () { on = false; root.cancelAnimationFrame(raf); };
    root.document.addEventListener('visibilitychange', function () { if (root.document.hidden) { if (on) root.cancelAnimationFrame(raf); } else if (on) { raf = root.requestAnimationFrame(tick); } });
  }
  function glow(ctx, x, y, r, rgb, a) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }

  // ---- scenery, all on the 1280 x 720 board ----
  function space(ctx, W, H, dim) {
    var g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#04050d'); g.addColorStop(0.5, '#0a0b24'); g.addColorStop(1, '#120a2e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (dim) { ctx.fillStyle = 'rgba(3,4,12,' + dim + ')'; ctx.fillRect(0, 0, W, H); }
  }
  // the Milky Way: a soft diagonal band with a warm core and dark dust lanes
  function milky(ctx, t) {
    ctx.save(); ctx.translate(640, 360); ctx.rotate(-0.5);
    var g = ctx.createLinearGradient(0, -230, 0, 230);
    g.addColorStop(0, 'rgba(120,130,255,0)'); g.addColorStop(0.35, 'rgba(150,140,255,.16)'); g.addColorStop(0.5, 'rgba(235,215,255,.26)'); g.addColorStop(0.65, 'rgba(150,140,255,.16)'); g.addColorStop(1, 'rgba(120,130,255,0)');
    ctx.fillStyle = g; ctx.fillRect(-1100, -230, 2200, 460);
    glow(ctx, -80, 0, 330, '255,210,170', 0.22); glow(ctx, 360, -10, 240, '190,170,255', 0.16); glow(ctx, -480, 10, 260, '120,200,255', 0.12);
    ctx.fillStyle = 'rgba(4,5,16,.42)';
    [[-300, -14, 360, 16], [120, 20, 420, 12], [-640, 30, 300, 10]].forEach(function (d) { ctx.beginPath(); ctx.ellipse(d[0], d[1], d[2] / 2, d[3], 0, 0, 7); ctx.fill(); });
    ctx.restore();
  }
  function nebula(ctx) {
    glow(ctx, 210, 150, 360, '157,123,255', 0.2); glow(ctx, 1080, 560, 420, '255,79,216', 0.12); glow(ctx, 900, 140, 300, '77,227,255', 0.1);
  }
  function stars(ctx, t, drift) {
    for (var i = 0; i < STARS.length; i++) {
      var s = STARS[i], x = (s.x + drift * s.z * 6) % 1280, tw = 0.55 + 0.45 * Math.sin(t * (0.6 + s.z) + s.p);
      ctx.globalAlpha = Math.min(1, tw * (0.35 + s.z * 0.55));
      ctx.fillStyle = s.hue < 0.18 ? '#bfe6ff' : (s.hue > 0.86 ? '#ffd9b5' : '#ffffff');
      var r = 0.5 + s.z * 0.9;
      ctx.fillRect(x, s.y, r, r);
      if (s.z > 1.05) { ctx.globalAlpha *= 0.35; ctx.fillRect(x - 3, s.y + r / 2 - 0.3, 7 + r, 0.7); ctx.fillRect(x + r / 2 - 0.3, s.y - 3, 0.7, 7 + r); }
    }
    ctx.globalAlpha = 1;
  }
  // a planet with a lit side, a dark side and (optionally) a tilted ring
  function planet(ctx, x, y, r, c1, c2, c3, ring, bands) {
    if (ring) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.32); ctx.strokeStyle = ring; ctx.lineWidth = r * 0.07; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.75, r * 0.46, 0, Math.PI, Math.PI * 2); ctx.stroke(); ctx.lineWidth = r * 0.035; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.95, r * 0.52, 0, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.clip();
    var g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r * 1.1);
    g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, c3);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    if (bands) { for (var i = 0; i < bands; i++) { ctx.fillStyle = 'rgba(255,255,255,' + (i % 2 ? 0.06 : 0.1) + ')'; ctx.fillRect(x - r, y - r + (i + 0.6) * (2 * r / (bands + 1)), r * 2, r * 0.09); } }
    var sh = ctx.createRadialGradient(x + r * 0.55, y + r * 0.45, r * 0.3, x + r * 0.55, y + r * 0.45, r * 1.5);
    sh.addColorStop(0, 'rgba(2,3,10,0)'); sh.addColorStop(1, 'rgba(2,3,10,.82)');
    ctx.fillStyle = sh; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
    glow(ctx, x, y, r * 1.5, '140,150,255', 0.08);
    if (ring) { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.32); ctx.strokeStyle = ring; ctx.lineWidth = r * 0.07; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.75, r * 0.46, 0, 0, Math.PI); ctx.stroke(); ctx.lineWidth = r * 0.035; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.95, r * 0.52, 0, 0, Math.PI); ctx.stroke(); ctx.restore(); }
  }
  // a distant sun and the faint orbit lines of a solar system
  function system(ctx, cx, cy) {
    ctx.strokeStyle = 'rgba(160,170,255,.08)'; ctx.lineWidth = 1;
    [180, 300, 440, 600].forEach(function (r) { ctx.beginPath(); ctx.ellipse(cx, cy, r, r * 0.3, -0.18, 0, 7); ctx.stroke(); });
    glow(ctx, cx, cy, 90, '255,200,120', 0.5); glow(ctx, cx, cy, 34, '255,240,200', 0.95);
  }
  function shooting(ctx, t, n) {
    for (var i = 0; i < n; i++) {
      var ph = (t * 0.18 + i * 0.37) % 1.6; if (ph > 0.35) continue;
      var k = ph / 0.35, x = 1280 - ((i * 431) % 900) - k * 520, y = 40 + ((i * 197) % 320) + k * 230, a = Math.sin(k * Math.PI);
      var g = ctx.createLinearGradient(x, y, x + 130, y - 88); g.addColorStop(0, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 130, y - 88); ctx.stroke();
    }
  }
  // a small rocket, nose up, with a flame
  function rocket(ctx, x, y, s, fire, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (fire > 0) { var fl = 40 + fire * 70 + Math.sin(t * 40) * 8; var g = ctx.createLinearGradient(0, 40, 0, 40 + fl); g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(0.35, 'rgba(255,160,80,.9)'); g.addColorStop(1, 'rgba(255,80,200,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-14, 38); ctx.quadraticCurveTo(0, 40 + fl * 1.1, 14, 38); ctx.fill(); glow(ctx, 0, 60 + fl * 0.3, 90, '255,150,100', 0.3 * fire); }
    ctx.fillStyle = '#c9d2ff'; ctx.beginPath(); ctx.moveTo(0, -100); ctx.quadraticCurveTo(30, -60, 24, 40); ctx.lineTo(-24, 40); ctx.quadraticCurveTo(-30, -60, 0, -100); ctx.fill();
    ctx.fillStyle = '#7f8cff'; ctx.beginPath(); ctx.moveTo(0, -100); ctx.quadraticCurveTo(12, -80, 14, -52); ctx.lineTo(-14, -52); ctx.quadraticCurveTo(-12, -80, 0, -100); ctx.fill();
    ctx.fillStyle = '#0a0d22'; ctx.beginPath(); ctx.arc(0, -22, 11, 0, 7); ctx.fill(); ctx.fillStyle = CYAN; ctx.beginPath(); ctx.arc(0, -22, 8, 0, 7); ctx.fill();
    ctx.fillStyle = MAGENTA; ctx.beginPath(); ctx.moveTo(-24, 14); ctx.lineTo(-48, 52); ctx.lineTo(-24, 40); ctx.fill(); ctx.beginPath(); ctx.moveTo(24, 14); ctx.lineTo(48, 52); ctx.lineTo(24, 40); ctx.fill();
    ctx.restore();
  }

  // ---- the quiet backdrop: stars, the Milky Way, nebula glow and a couple of planets ----
  function GridBg(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), self = this, fps = o.fps || 10;
    function draw(t) {
      sizeCanvas(cv); var W = cv.width, H = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      space(ctx, W, H, 0.12);
      var sc = Math.max(W / 1280, H / 720);
      ctx.setTransform(sc, 0, 0, sc, (W - 1280 * sc) * 0.5, (H - 720 * sc) * 0.5);
      nebula(ctx); milky(ctx, t); stars(ctx, t, t * 0.6);
      planet(ctx, 1110, 170, 70, '#c9a4ff', '#6a4ad0', '#1a1050', '#b9a8ff', 0);
      planet(ctx, 160, 600, 46, '#ffc08a', '#c8584a', '#3a1230', null, 6);
      shooting(ctx, t, 2);
    }
    loop(self, fps, draw);
    if (reduce) { self.start = function () { draw(0); }; }
  }

  // ---- the intro: a loading screen with a ringed planet, a distant sun, a countdown and a rocket on the pad ----
  function GridIntro(cv, o) {
    o = o || {};
    var ctx = cv.getContext('2d'), self = this, faces = o.faces || [], t0 = 0;
    function draw(t) {
      if (!t0) t0 = t;
      var e = t - t0;
      sizeCanvas(cv); var W = cv.width, H = cv.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      space(ctx, W, H, 0);
      var sc = Math.max(W / 1280, H / 720), ox = (W - 1280 * sc) * 0.5, oy = (H - 720 * sc) * 0.5;
      ctx.setTransform(sc, 0, 0, sc, ox, oy);
      nebula(ctx); milky(ctx, e); stars(ctx, e, e * 1.4);
      system(ctx, 330, 250);
      planet(ctx, 960, 420, 120, '#e9d4ff', '#7a58e0', '#160c46', 'rgba(215,200,255,.75)', 0);
      planet(ctx, 520, 560, 58, '#ffd2a0', '#d0605a', '#3a1230', null, 7);
      planet(ctx, 720, 120, 22, '#d6f6ff', '#4a9fd8', '#0c1f4a', null, 0);
      shooting(ctx, e, 4);
      // the countdown loops: T-10 down to zero, then liftoff, then the pad resets
      var cycle = 14, c = e % cycle, left = Math.max(0, 10 - Math.floor(c)), lift = c > 10 ? Math.min(1, (c - 10) / 3.5) : 0;
      var ry = 640 - lift * lift * 820, wob = c < 10 ? 0 : Math.sin(c * 50) * 2;
      ctx.fillStyle = 'rgba(8,10,28,.95)'; ctx.fillRect(560, 686, 300, 34); ctx.fillStyle = 'rgba(157,123,255,.7)'; ctx.fillRect(560, 686, 300, 2);
      rocket(ctx, 710 + wob, ry, 1.1, c < 8 ? 0 : (c < 10 ? (c - 8) / 2 * 0.4 : 1), e);
      ctx.fillStyle = CYAN; ctx.font = '500 22px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText(c < 10 ? 'T-' + String(left).padStart(2, '0') : (lift < 1 ? 'LIFTOFF' : 'ORBIT'), 710, 60);
      ctx.textAlign = 'left';
      // four pilots in round portholes
      var xs = [780, 900, 1020, 1140], ys = [170, 230, 160, 220];
      ctx.imageSmoothingEnabled = true;
      xs.forEach(function (x, i) {
        var im = faces[i], w = 108, bob = Math.sin(e * 0.9 + i) * 4, cx = x, cy = ys[i] + bob;
        ctx.save();
        glow(ctx, cx, cy, w * 0.95, i % 2 ? '255,79,216' : '77,227,255', 0.22);
        ctx.beginPath(); ctx.arc(cx, cy, w / 2, 0, 7); ctx.fillStyle = '#0a0d22'; ctx.fill(); ctx.clip();
        if (im && im.complete && im.naturalWidth) ctx.drawImage(im, cx - w / 2, cy - w / 2, w, w);
        ctx.restore();
        ctx.lineWidth = 5; ctx.strokeStyle = i % 2 ? MAGENTA : CYAN; ctx.beginPath(); ctx.arc(cx, cy, w / 2 + 2, 0, 7); ctx.stroke();
        ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(cx, cy, w / 2 + 9, 0, 7); ctx.stroke();
      });
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      var v = ctx.createRadialGradient(W * 0.55, H * 0.5, Math.min(W, H) * 0.35, W * 0.55, H * 0.5, Math.max(W, H) * 0.9); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(2,3,10,.7)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    }
    loop(self, o.fps || 30, draw);
    if (reduce) { self.start = function () { draw(0); }; }
  }
  GridIntro.LOGS = LOGS;
  GridIntro.create = function (cv, o) { return new GridIntro(cv, o); };

  root.GridBg = GridBg; root.GridIntro = GridIntro;
})(window);
