'use strict';
// PetPad's coin-page extras, plain 2D canvas: the adoption journey (how far the coin has travelled along its bonding curve) and the adoption certificate
// (a card with the pet, the ride, the ticker and the name tag, to download and share). Original art.
(function (root) {
  var CY = '#ffc46b', VI = '#ff8a7a', MG = '#ff6f8a', AM = '#ffd98a';
  function rnd(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function accent(look) { var a = root.Ships.ACCENTS[(look && look.accent) | 0]; return a ? a[1] : CY; }
  function glow(ctx, x, y, r, rgb, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function stars(ctx, W, H, n, seed) { for (var i = 0; i < n; i++) { ctx.globalAlpha = 0.3 + rnd(i + seed + 9) * 0.7; ctx.fillStyle = '#fff'; var r = 0.6 + rnd(i + seed + 4) * 1.4; ctx.fillRect(rnd(i + seed) * W, rnd(i + seed + 50) * H, r, r); } ctx.globalAlpha = 1; }

  // ---- the adoption journey: the ride travels from the shelter to a forever home as the coin fills its curve ----
  var STAGES = [[0, 'Intake'], [20, 'Vet check'], [40, 'Foster home'], [60, 'Meet and greet'], [80, 'Adoption day'], [100, 'Forever home']];
  function stageName(p, done) { if (done) return 'Forever home (adopted)'; var n = STAGES[0][1]; STAGES.forEach(function (s) { if (p >= s[0]) n = s[1]; }); return n; }
  function heartPath(ctx, x, y, s) { ctx.beginPath(); ctx.moveTo(x, y + s * 0.4); ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.5, y - s * 1.1, x, y - s * 0.5); ctx.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s, y - s * 0.4, x, y + s * 0.4); ctx.fill(); }
  function Orbit(cv, o) {
    var ctx = cv.getContext('2d'), self = this, raf = 0, on = false, W = 0, H = 0, dpr = 1, t0 = 0, prog = 0, done = false, ready = false;
    var reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    function size() { dpr = Math.min(root.devicePixelRatio || 1, 2); W = cv.clientWidth || 700; H = cv.clientHeight || 190; if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); } }
    self.set = function (p, d) { prog = Math.max(0, Math.min(100, +p || 0)); done = !!d; ready = true; if (!on) self.draw(0); };
    self.draw = function (t) {
      size(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1d3c'); g.addColorStop(0.6, '#8a4560'); g.addColorStop(1, '#e8905f'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      var x0 = 76, x1 = W - 96, y = H * 0.66, p = ready ? prog : 0, k = (done ? 100 : p) / 100;
      ctx.fillStyle = '#3c2a46'; ctx.fillRect(0, y + 22, W, H - y - 22);
      // the road and its stage marks
      ctx.lineCap = 'round'; ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,240,220,.2)'; ctx.beginPath(); ctx.moveTo(x0, y + 12); ctx.lineTo(x1, y + 12); ctx.stroke();
      var tg = ctx.createLinearGradient(x0, 0, x1, 0); tg.addColorStop(0, '#ffc46b'); tg.addColorStop(1, '#ff8a7a'); ctx.strokeStyle = tg; ctx.beginPath(); ctx.moveTo(x0, y + 12); ctx.lineTo(x0 + (x1 - x0) * k, y + 12); ctx.stroke();
      ctx.font = '500 11px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      STAGES.forEach(function (s) { var x = x0 + (x1 - x0) * s[0] / 100, hit = (done ? 100 : p) >= s[0]; ctx.fillStyle = hit ? '#fff4de' : 'rgba(255,240,220,.6)'; ctx.beginPath(); ctx.arc(x, y + 12, hit ? 5 : 3.5, 0, 7); ctx.fill(); ctx.fillText(s[1], Math.min(W - 40, Math.max(40, x)), y + 40); });
      // the shelter on the left, the forever home on the right
      ctx.fillStyle = '#7a5a6a'; ctx.fillRect(x0 - 62, y - 48, 54, 56); ctx.fillStyle = '#a06a58'; ctx.beginPath(); ctx.moveTo(x0 - 68, y - 48); ctx.lineTo(x0 - 35, y - 72); ctx.lineTo(x0 - 2, y - 48); ctx.fill(); ctx.fillStyle = '#ff8aa0'; heartPath(ctx, x0 - 35, y - 28, 9);
      var hx = x1 + 52; ctx.fillStyle = '#c28a62'; ctx.fillRect(hx - 36, y - 52, 72, 60); ctx.fillStyle = '#d65a4a'; ctx.beginPath(); ctx.moveTo(hx - 44, y - 52); ctx.lineTo(hx, y - 84); ctx.lineTo(hx + 44, y - 52); ctx.fill();
      ctx.fillStyle = done ? '#ffe08a' : '#5a4a50'; ctx.fillRect(hx - 24, y - 36, 16, 16); ctx.fillStyle = '#5a3a30'; ctx.fillRect(hx + 6, y - 28, 16, 36);
      if (done) { ctx.fillStyle = '#ff6f8a'; for (var i = 0; i < 4; i++) { var q = ((t * 0.5 + i * 0.25) % 1); ctx.globalAlpha = 1 - q; heartPath(ctx, hx - 20 + i * 14, y - 96 - q * 30, 7); } ctx.globalAlpha = 1; }
      // the ride, with the pet looking out
      var sx = x0 + (x1 - x0) * k, bob = reduce ? 0 : Math.sin(t * 2) * 2;
      root.Ships.draw(ctx, o.ship, done ? hx - 56 : sx, y - 20 + bob, 0.44, done || reduce ? 0 : 1, t, o.look, o.logo, o.face);
      ctx.textAlign = 'left'; ctx.font = '600 13px "JetBrains Mono", monospace'; ctx.fillStyle = '#ffd98a'; ctx.fillText('ADOPTION JOURNEY', 16, 22);
      ctx.fillStyle = '#fff4de'; ctx.font = '500 13px "JetBrains Mono", monospace'; ctx.fillText(ready ? (done ? 'Adopted: home at last' : p.toFixed(1) + '% of the way · ' + stageName(p, false)) : 'Reading the chain…', 16, 42);
    };
    function tick(ts) { if (!on) return; raf = root.requestAnimationFrame(tick); if (!t0) t0 = ts; self.draw((ts - t0) / 1000); }
    self.start = function () { if (on || reduce) { self.draw(0); return; } on = true; raf = root.requestAnimationFrame(tick); };
    self.stop = function () { on = false; root.cancelAnimationFrame(raf); };
    root.addEventListener('resize', function () { if (!on) self.draw(0); });
  }
  Orbit.stageName = stageName;

  // ---- the mission patch ----
  function arcText(ctx, text, cx, cy, r, top, size, col, spacing) {
    ctx.font = '700 ' + size + 'px Inter, "Space Grotesk", sans-serif'; ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    var w = 0, i, ws = []; for (i = 0; i < text.length; i++) { ws.push(ctx.measureText(text[i]).width + spacing); w += ws[i]; }
    var a = (top ? -Math.PI / 2 - w / (2 * r) : Math.PI / 2 + w / (2 * r));
    for (i = 0; i < text.length; i++) { var half = ws[i] / (2 * r); a += top ? half : -half; ctx.save(); ctx.translate(cx + r * Math.cos(a), cy + r * Math.sin(a)); ctx.rotate(top ? a + Math.PI / 2 : a - Math.PI / 2); ctx.fillText(text[i], 0, 0); ctx.restore(); a += top ? half : -half; }
  }
  function drawPatch(cv, o) {
    var S = 1000, ctx = cv.getContext('2d'), acc = accent(o.look), C = S / 2;
    if (cv.width !== S) { cv.width = S; cv.height = S; }
    ctx.clearRect(0, 0, S, S);
    // warm paper with a stitched border
    var pg = ctx.createLinearGradient(0, 0, S, S); pg.addColorStop(0, '#fff4de'); pg.addColorStop(1, '#f6dfb8'); ctx.fillStyle = pg; ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = '#8a4560'; ctx.lineWidth = 14; ctx.strokeRect(26, 26, S - 52, S - 52); ctx.setLineDash([20, 12]); ctx.strokeStyle = '#e8905f'; ctx.lineWidth = 6; ctx.strokeRect(50, 50, S - 100, S - 100); ctx.setLineDash([]);
    // paw prints in the corners
    ctx.fillStyle = 'rgba(138,69,96,.14)'; [[110, 120], [890, 120], [110, 880], [890, 880]].forEach(function (p) { ctx.beginPath(); ctx.ellipse(p[0], p[1] + 10, 30, 24, 0, 0, 7); ctx.fill(); [[-26, -26], [-9, -40], [9, -40], [26, -26]].forEach(function (q) { ctx.beginPath(); ctx.ellipse(p[0] + q[0], p[1] + q[1], 9, 12, 0, 0, 7); ctx.fill(); }); });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#8a4560'; ctx.font = '700 46px "Space Grotesk", Inter, sans-serif'; ctx.fillText('CERTIFICATE OF ADOPTION', C, 122);
    ctx.fillStyle = '#b8603a'; ctx.font = '500 24px Inter, sans-serif'; ctx.fillText('This pet found its forever home on PetPad', C, 166);
    // the pet's portrait in a round frame
    var fr = 158, fx = C, fy = 350;
    ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, fr, 0, 7); ctx.clip(); if (o.face && o.face.complete && o.face.naturalWidth) ctx.drawImage(o.face, fx - fr, fy - fr, fr * 2, fr * 2); else { ctx.fillStyle = '#4a3550'; ctx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2); } ctx.restore();
    ctx.lineWidth = 12; ctx.strokeStyle = '#8a4560'; ctx.beginPath(); ctx.arc(fx, fy, fr + 6, 0, 7); ctx.stroke(); ctx.lineWidth = 4; ctx.strokeStyle = acc === '#ffffff' || acc === '#fff4de' ? '#e8905f' : acc; ctx.beginPath(); ctx.arc(fx, fy, fr + 22, 0, 7); ctx.stroke();
    // the name and the coin
    var tag = (o.call || o.agent || 'PET').toUpperCase();
    ctx.fillStyle = '#3a2438'; ctx.font = '700 64px "JetBrains Mono", monospace'; ctx.fillText(tag, C, 580);
    ctx.fillStyle = '#b8603a'; ctx.font = '600 28px "JetBrains Mono", monospace'; ctx.fillText((o.breed ? String(o.breed).toUpperCase() + '  ·  ' : '') + 'ADOPTED', C, 628);
    ctx.fillStyle = '#8a4560'; ctx.font = '700 40px Inter, sans-serif'; ctx.fillText(('$' + (o.sym || '')).toUpperCase() + '  ·  ' + String(o.name || '').slice(0, 22), C, 700);
    root.Ships.draw(ctx, o.ship, C, 836, 1.15, 0, 1.2, o.look, o.logo, o.face);
    ctx.fillStyle = '#b8603a'; ctx.font = '500 22px Inter, sans-serif';
    ctx.fillText(o.charity ? 'Helping ' + o.charity : 'petpad · pump.fun', C, 940);
  }
  root.Mission = { Orbit: Orbit, drawPatch: drawPatch, stageName: stageName };
})(window);
