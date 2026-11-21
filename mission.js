'use strict';
// PetPad's coin-page extras, plain 2D canvas: the orbit tracker (how far the coin has climbed its bonding curve) and the mission patch
// (a round embroidered-style badge with the pet, the ship, the ticker and the callsign, to download and share). Original art.
(function (root) {
  var CY = '#4de3ff', VI = '#9d7bff', MG = '#ff4fd8', AM = '#ffd98a';
  function rnd(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  function accent(look) { var a = root.Ships.ACCENTS[(look && look.accent) | 0]; return a ? a[1] : CY; }
  function glow(ctx, x, y, r, rgb, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
  function stars(ctx, W, H, n, seed) { for (var i = 0; i < n; i++) { ctx.globalAlpha = 0.3 + rnd(i + seed + 9) * 0.7; ctx.fillStyle = '#fff'; var r = 0.6 + rnd(i + seed + 4) * 1.4; ctx.fillRect(rnd(i + seed) * W, rnd(i + seed + 50) * H, r, r); } ctx.globalAlpha = 1; }

  // ---- the orbit tracker: a ship climbing from the pad to orbit as the coin fills its curve ----
  var STAGES = [[0, 'Pad'], [25, 'Climb'], [50, 'Cruise'], [75, 'High orbit'], [90, 'Final burn'], [100, 'Orbit']];
  function stageName(p, done) { if (done) return 'In orbit (graduated)'; var n = STAGES[0][1]; STAGES.forEach(function (s) { if (p >= s[0]) n = s[1]; }); return n; }
  function Orbit(cv, o) {
    var ctx = cv.getContext('2d'), self = this, raf = 0, on = false, W = 0, H = 0, dpr = 1, t0 = 0, prog = 0, done = false, ready = false;
    var reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
    function size() { dpr = Math.min(root.devicePixelRatio || 1, 2); W = cv.clientWidth || 700; H = cv.clientHeight || 190; if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); } }
    self.set = function (p, d) { prog = Math.max(0, Math.min(100, +p || 0)); done = !!d; ready = true; if (!on) self.draw(0); };
    self.draw = function (t) {
      size(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var g = ctx.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#0a0b26'); g.addColorStop(1, '#150b32'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      stars(ctx, W, H, 70, 3); glow(ctx, W - 70, H / 2, 120, '157,123,255', 0.25);
      var x0 = 70, x1 = W - 90, y = H * 0.52, p = ready ? prog : 0, k = (done ? 100 : p) / 100;
      // the track and its stage marks
      ctx.lineCap = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(170,182,232,.18)'; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
      var tg = ctx.createLinearGradient(x0, 0, x1, 0); tg.addColorStop(0, CY); tg.addColorStop(1, MG); ctx.strokeStyle = tg; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + (x1 - x0) * k, y); ctx.stroke();
      ctx.font = '500 11px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      STAGES.forEach(function (s) { var x = x0 + (x1 - x0) * s[0] / 100, hit = (done ? 100 : p) >= s[0]; ctx.fillStyle = hit ? '#eef2ff' : 'rgba(170,182,232,.6)'; ctx.beginPath(); ctx.arc(x, y, hit ? 5 : 3.5, 0, 7); ctx.fill(); ctx.fillText(s[0] + '%', x, y + 30); ctx.fillText(s[1], x, y + 46); });
      // pad on the left, ringed planet (orbit) on the right
      ctx.fillStyle = '#10143a'; ctx.fillRect(x0 - 40, y + 14, 80, 6); ctx.fillStyle = 'rgba(157,123,255,.8)'; ctx.fillRect(x0 - 40, y + 14, 80, 2);
      var px = x1 + 36, pr = 26; ctx.strokeStyle = 'rgba(215,200,255,.7)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(px, y, pr * 1.7, pr * 0.45, -0.3, Math.PI, 7); ctx.stroke();
      var pg = ctx.createRadialGradient(px - 8, y - 8, 3, px, y, pr); pg.addColorStop(0, '#e9d4ff'); pg.addColorStop(0.6, '#7a58e0'); pg.addColorStop(1, '#160c46'); ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(px, y, pr, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(px, y, pr * 1.7, pr * 0.45, -0.3, 0, Math.PI); ctx.stroke();
      // the ship, nose to the right, bobbing a little
      var sx = x0 + (x1 - x0) * k, bob = reduce ? 0 : Math.sin(t * 2) * 3, sc = 0.34;
      if (done) { ctx.strokeStyle = 'rgba(77,227,255,.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(px, y, pr * 2.3, pr * 0.9, -0.3, 0, 7); ctx.stroke(); sx = px - 70 + Math.cos(t * 0.8) * 52; }
      ctx.save(); ctx.translate(sx, y - 30 + bob + (done ? Math.sin(t * 0.8) * 10 : 0)); ctx.rotate(Math.PI / 2); root.Ships.draw(ctx, o.ship, 0, 0, sc, reduce ? 0 : 0.6, t, o.look, o.logo); ctx.restore();
      ctx.textAlign = 'left'; ctx.font = '600 13px "JetBrains Mono", monospace'; ctx.fillStyle = CY; ctx.fillText('ORBIT TRACKER', 16, 22);
      ctx.fillStyle = '#eef2ff'; ctx.font = '500 13px "JetBrains Mono", monospace'; ctx.fillText(ready ? (done ? 'Reached orbit' : p.toFixed(1) + '% of the climb · ' + stageName(p, false)) : 'Reading the chain…', 16, 42);
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
    // outer border: a dark ring with a stitched edge
    ctx.fillStyle = '#05060f'; ctx.beginPath(); ctx.arc(C, C, 492, 0, 7); ctx.fill();
    ctx.strokeStyle = acc; ctx.lineWidth = 8; ctx.setLineDash([22, 14]); ctx.beginPath(); ctx.arc(C, C, 478, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#0c1030'; ctx.beginPath(); ctx.arc(C, C, 452, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(C, C, 366, 0, 7); ctx.stroke();
    // the sky inside
    ctx.save(); ctx.beginPath(); ctx.arc(C, C, 362, 0, 7); ctx.clip();
    var g = ctx.createLinearGradient(0, 0, S, S); g.addColorStop(0, '#04050f'); g.addColorStop(0.55, '#0e1034'); g.addColorStop(1, '#2a1260'); ctx.fillStyle = g; ctx.fillRect(0, 0, S, S);
    glow(ctx, 300, 330, 300, '157,123,255', 0.3); glow(ctx, 760, 760, 300, '255,79,216', 0.22); stars(ctx, S, S, 160, 17);
    ctx.save(); ctx.translate(C, C); ctx.rotate(-0.5); var mw = ctx.createLinearGradient(0, -90, 0, 90); mw.addColorStop(0, 'rgba(200,190,255,0)'); mw.addColorStop(0.5, 'rgba(235,225,255,.2)'); mw.addColorStop(1, 'rgba(200,190,255,0)'); ctx.fillStyle = mw; ctx.fillRect(-500, -90, 1000, 180); ctx.restore();
    // pet medallion, then the ship below it
    var fr = 128, fx = C, fy = 340;
    glow(ctx, fx, fy, fr * 1.9, '77,227,255', 0.25);
    ctx.save(); ctx.beginPath(); ctx.arc(fx, fy, fr, 0, 7); ctx.clip(); if (o.face && o.face.complete && o.face.naturalWidth) ctx.drawImage(o.face, fx - fr, fy - fr, fr * 2, fr * 2); else { ctx.fillStyle = '#10143a'; ctx.fillRect(fx - fr, fy - fr, fr * 2, fr * 2); } ctx.restore();
    ctx.lineWidth = 9; ctx.strokeStyle = acc; ctx.beginPath(); ctx.arc(fx, fy, fr + 4, 0, 7); ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.arc(fx, fy, fr + 20, 0, 7); ctx.stroke();
    root.Ships.draw(ctx, o.ship, C, 672, 1.3, 0.7, 1.2, o.look, o.logo);
    ctx.restore();
    // text on the border
    arcText(ctx, 'PETPAD  ·  MISSION PATCH', C, C, 414, true, 38, '#eef2ff', 5);
    arcText(ctx, ('$' + (o.sym || '')).toUpperCase() + '  ·  ' + String(o.name || '').toUpperCase().slice(0, 22), C, C, 414, false, 40, acc, 5);
    // name tag across the lower part of the sky
    var tag = (o.call || o.agent || 'PET').toUpperCase(), role = (o.role || '').toUpperCase();
    ctx.font = '700 40px "JetBrains Mono", monospace'; var tw = Math.max(240, ctx.measureText(tag).width + 70);
    ctx.fillStyle = 'rgba(5,6,15,.9)'; ctx.strokeStyle = acc; ctx.lineWidth = 4; var tx = C - tw / 2, ty = 736, th = 88, r = 16;
    ctx.beginPath(); ctx.moveTo(tx + r, ty); ctx.arcTo(tx + tw, ty, tx + tw, ty + th, r); ctx.arcTo(tx + tw, ty + th, tx, ty + th, r); ctx.arcTo(tx, ty + th, tx, ty, r); ctx.arcTo(tx, ty, tx + tw, ty, r); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#eef2ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(tag, C, ty + 34);
    ctx.font = '500 22px "JetBrains Mono", monospace'; ctx.fillStyle = acc; ctx.fillText(role || (o.mint ? o.mint.slice(0, 4) + '…' + o.mint.slice(-4) : ''), C, ty + 68);
  }
  root.Mission = { Orbit: Orbit, drawPatch: drawPatch, stageName: stageName };
})(window);
