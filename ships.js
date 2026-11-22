'use strict';
// PetPad's rides: six original little vehicles drawn in code on a 2D canvas, side view, facing right, origin at the middle.
// The launch form lets you pick one; the coin page shows it; a short adoption-day scene plays after a launch.
// This file runs in the browser (window.Ships) and in Node (the server only needs the list of ids and the colour lists).
(function (root) {
  var SHIPS = [
    { id: 'wagon', name: 'Red Wagon', tag: 'Rattles along, never lets anyone down.' },
    { id: 'van', name: 'Rescue Van', tag: 'The classic shelter van, with a window for the pet.' },
    { id: 'box', name: 'Cardboard Box', tag: 'On wheels. Pets love a box.' },
    { id: 'sled', name: 'Snow Sled', tag: 'Smooth runners, fast downhill.' },
    { id: 'bus', name: 'Shelter Bus', tag: 'Room for the whole crew.' },
    { id: 'balloon', name: 'Balloon Basket', tag: 'Floats over the town to its new home.' },
  ];
  var ids = SHIPS.map(function (s) { return s.id; });
  // body colours, trim colours and collar colours: the launcher picks an index (the server only accepts a value from the list)
  var HULLS = [['Cherry', '#e0524e'], ['Sunny', '#ffd24a'], ['Sky', '#5aa8f0'], ['Mint', '#5cd1a4'], ['Plum', '#9a64d8'], ['Peach', '#ff9f7a'], ['Cream', '#f3e6cc'], ['Charcoal', '#4a4658']];
  var ACCENTS = [['Cream', '#fff4de'], ['Rose', '#ff7aa8'], ['Teal', '#1fb8a8'], ['Amber', '#ffb02e'], ['Navy', '#2f3f86'], ['Red', '#e0443e'], ['White', '#ffffff'], ['Lime', '#9be83a']];
  var SUITS = [['Red', '#c8383f'], ['Orange', '#ff7a2e'], ['Gold', '#f2c230'], ['Green', '#3f8a5a'], ['Blue', '#3a6ad0'], ['Purple', '#7a4ad0'], ['Pink', '#e8609a'], ['Black', '#22222c']];
  if (typeof window === 'undefined') { root.SHIPS = SHIPS; root.HULLS = HULLS; root.ACCENTS = ACCENTS; root.SUITS = SUITS; root.isShip = function (v) { return ids.indexOf(v) >= 0; }; return; }

  function hex(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function rgb(a) { return 'rgb(' + Math.round(a[0]) + ',' + Math.round(a[1]) + ',' + Math.round(a[2]) + ')'; }
  function mixc(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  var K = null;
  function setK(look) {
    look = look || {}; var h = hex(root.Ships.HULLS[look.hull | 0] ? root.Ships.HULLS[look.hull | 0][1] : '#e0524e'), a = hex(root.Ships.ACCENTS[look.accent | 0] ? root.Ships.ACCENTS[look.accent | 0][1] : '#fff4de');
    K = { l: rgb(mixc(h, [255, 255, 255], 0.35)), m: rgb(h), d: rgb(mixc(h, [30, 16, 40], 0.4)), a: rgb(a), a2: rgb(mixc(a, [30, 16, 40], 0.3)) };
  }
  function lg(ctx, x0, y0, x1, y1, stops) { var g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(function (s) { g.addColorStop(s[0], s[1]); }); return g; }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function wheel(ctx, x, y, r, t) {
    ctx.fillStyle = '#241c2c'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = '#d8d2e0'; ctx.beginPath(); ctx.arc(x, y, r * 0.55, 0, 7); ctx.fill();
    ctx.strokeStyle = K.a2; ctx.lineWidth = 1.6; var a = t * 8 + x; for (var i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a + i * 2.09) * r * 0.55, y + Math.sin(a + i * 2.09) * r * 0.55); ctx.stroke(); }
    ctx.fillStyle = K.a; ctx.beginPath(); ctx.arc(x, y, r * 0.16, 0, 7); ctx.fill();
  }
  // the pet looking out of the ride: a round portrait with a warm rim
  function pet(ctx, face, x, y, r) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = '#4a3550'; ctx.fill(); ctx.clip();
    if (face && face.complete && face.naturalWidth) ctx.drawImage(face, x - r * 1.12, y - r * 1.02, r * 2.24, r * 2.24);
    ctx.restore(); ctx.lineWidth = 2.4; ctx.strokeStyle = '#fff4de'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
  }

  var SEAT = { wagon: [4, -22, 23], van: [-6, -8, 17], box: [0, -20, 24], sled: [-4, -20, 22], bus: [26, -6, 15], balloon: [0, 12, 19] };
  var DRAW = {
    wagon: function (ctx, t, face, f) {
      ctx.strokeStyle = K.a2; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(48, 6); ctx.quadraticCurveTo(66, 4, 76, -16); ctx.stroke(); ctx.lineCap = 'butt';
      pet(ctx, face, SEAT.wagon[0], SEAT.wagon[1], SEAT.wagon[2]);
      ctx.fillStyle = lg(ctx, 0, -6, 0, 24, [[0, K.l], [1, K.m]]); rr(ctx, -50, -6, 100, 30, 6); ctx.fill();
      ctx.fillStyle = K.a; rr(ctx, -50, -8, 100, 6, 3); ctx.fill(); ctx.fillStyle = K.d; ctx.fillRect(-46, 18, 92, 4);
      wheel(ctx, -28, 28, 11, t); wheel(ctx, 28, 28, 11, t);
    },
    van: function (ctx, t, face, f) {
      ctx.fillStyle = lg(ctx, 0, -28, 0, 26, [[0, K.l], [1, K.m]]); ctx.beginPath(); ctx.moveTo(-62, 24); ctx.lineTo(-62, -14); ctx.quadraticCurveTo(-62, -28, -48, -28); ctx.lineTo(18, -28); ctx.quadraticCurveTo(30, -28, 38, -14); ctx.lineTo(60, -6); ctx.quadraticCurveTo(66, -4, 66, 4); ctx.lineTo(66, 24); ctx.closePath(); ctx.fill();
      ctx.fillStyle = K.a; ctx.fillRect(-62, 8, 128, 6);
      ctx.fillStyle = '#bfe6ff'; ctx.beginPath(); ctx.moveTo(24, -22); ctx.lineTo(34, -22); ctx.lineTo(50, -8); ctx.lineTo(24, -8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#241c2c'; ctx.beginPath(); ctx.arc(-6, -8, 20, 0, 7); ctx.fill(); pet(ctx, face, SEAT.van[0], SEAT.van[1], SEAT.van[2]);
      ctx.fillStyle = '#fff4a8'; ctx.beginPath(); ctx.arc(64, 6, 3, 0, 7); ctx.fill();
      wheel(ctx, -36, 26, 12, t); wheel(ctx, 38, 26, 12, t);
    },
    box: function (ctx, t, face, f) {
      pet(ctx, face, SEAT.box[0], SEAT.box[1], SEAT.box[2]);
      ctx.fillStyle = K.d; ctx.beginPath(); ctx.moveTo(-42, -10); ctx.lineTo(-52, -26); ctx.lineTo(-30, -18); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(42, -10); ctx.lineTo(52, -26); ctx.lineTo(30, -18); ctx.closePath(); ctx.fill();
      ctx.fillStyle = lg(ctx, 0, -12, 0, 26, [[0, K.l], [1, K.m]]); ctx.fillRect(-44, -10, 88, 36);
      ctx.fillStyle = K.a; ctx.fillRect(-6, -10, 12, 36); ctx.fillStyle = K.d; ctx.fillRect(-44, 20, 88, 3);
      wheel(ctx, -28, 30, 8, t); wheel(ctx, 28, 30, 8, t);
    },
    sled: function (ctx, t, face, f) {
      ctx.strokeStyle = '#b8a08a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(52, 8); ctx.quadraticCurveTo(70, 6, 82, 14); ctx.stroke();
      pet(ctx, face, SEAT.sled[0], SEAT.sled[1], SEAT.sled[2]);
      ctx.fillStyle = lg(ctx, 0, -4, 0, 18, [[0, K.l], [1, K.m]]); rr(ctx, -50, -4, 100, 20, 5); ctx.fill(); ctx.fillStyle = K.a; ctx.fillRect(-50, 4, 100, 4);
      ctx.strokeStyle = '#4a4658'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-58, 28); ctx.lineTo(44, 28); ctx.quadraticCurveTo(62, 28, 60, 14); ctx.stroke(); ctx.lineCap = 'butt';
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-34, 16); ctx.lineTo(-34, 28); ctx.moveTo(30, 16); ctx.lineTo(30, 28); ctx.stroke();
    },
    bus: function (ctx, t, face, f) {
      ctx.fillStyle = lg(ctx, 0, -30, 0, 26, [[0, K.l], [1, K.m]]); rr(ctx, -76, -30, 152, 54, 10); ctx.fill(); ctx.fillStyle = K.a; ctx.fillRect(-76, 4, 152, 6); ctx.fillRect(-76, -30, 152, 5);
      ctx.fillStyle = '#bfe6ff'; for (var i = 0; i < 3; i++) { rr(ctx, -62 + i * 26, -18, 20, 16, 4); ctx.fill(); }
      ctx.fillStyle = '#241c2c'; ctx.beginPath(); ctx.arc(SEAT.bus[0], SEAT.bus[1], SEAT.bus[2] + 3, 0, 7); ctx.fill(); pet(ctx, face, SEAT.bus[0], SEAT.bus[1], SEAT.bus[2]);
      ctx.fillStyle = '#fff4a8'; ctx.beginPath(); ctx.arc(74, 4, 3, 0, 7); ctx.fill();
      wheel(ctx, -44, 26, 12, t); wheel(ctx, 10, 26, 12, t); wheel(ctx, 52, 26, 12, t);
    },
    balloon: function (ctx, t, face, f) {
      ctx.strokeStyle = '#6a5a4a'; ctx.lineWidth = 1.6; [[-22, 4], [22, 4], [-8, 6], [8, 6]].forEach(function (p) { ctx.beginPath(); ctx.moveTo(p[0] * 0.8, 4); ctx.lineTo(p[0] * 0.5, 22); ctx.stroke(); });
      ctx.fillStyle = lg(ctx, -40, 0, 40, 0, [[0, K.d], [0.45, K.l], [1, K.d]]); ctx.beginPath(); ctx.moveTo(-14, 6); ctx.bezierCurveTo(-52, -6, -52, -70, 0, -76); ctx.bezierCurveTo(52, -70, 52, -6, 14, 6); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = K.a; ctx.globalAlpha = 0.85; ctx.fillRect(-12, -80, 8, 90); ctx.fillRect(10, -80, 8, 90); ctx.restore(); ctx.globalAlpha = 1;
      pet(ctx, face, SEAT.balloon[0], SEAT.balloon[1], SEAT.balloon[2]);
      ctx.fillStyle = '#b8895a'; rr(ctx, -22, 16, 44, 22, 4); ctx.fill(); ctx.strokeStyle = '#8a6238'; ctx.lineWidth = 1.2; for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 8, 16); ctx.lineTo(i * 8, 38); ctx.stroke(); }
    },
  };
  // where the coin's logo sits on each ride: [x, y, radius]
  var EMB = { wagon: [-24, 8, 9], van: [-42, 4, 9], box: [0, 8, 14], sled: [36, 6, 8], bus: [-62, 6, 9], balloon: [0, -38, 18] };
  function emblem(ctx, id, im) {
    var e = EMB[id] || EMB.van; if (!im || !im.complete || !im.naturalWidth) return;
    ctx.save(); ctx.beginPath(); ctx.arc(e[0], e[1], e[2], 0, 7); ctx.clip(); ctx.drawImage(im, e[0] - e[2], e[1] - e[2], e[2] * 2, e[2] * 2); ctx.restore();
    ctx.lineWidth = 2.2; ctx.strokeStyle = '#241c2c'; ctx.beginPath(); ctx.arc(e[0], e[1], e[2] + 1, 0, 7); ctx.stroke(); ctx.lineWidth = 1.2; ctx.strokeStyle = K.a; ctx.beginPath(); ctx.arc(e[0], e[1], e[2] + 2.6, 0, 7); ctx.stroke();
  }

  // draw one ride centred on (x, y); moving is 0 to 1; face is an image of the pet; flip mirrors it to face left
  function draw(ctx, id, x, y, scale, moving, t, look, logo, face, flip) {
    var f = DRAW[id] || DRAW.van; id = DRAW[id] ? id : 'van'; setK(look); ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -scale : scale, scale);
    var bob = moving ? Math.sin(t * 9) * 1.2 : 0; ctx.translate(0, bob); f(ctx, (t || 0) * (moving ? 1 : 0.05), face, moving);
    emblem(ctx, id, logo); ctx.restore();
  }
  function thumb(cv, id, look, logo, face) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = cv.clientWidth || 96, h = cv.clientHeight || 96;
    cv.width = w * dpr; cv.height = h * dpr; var ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    var g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w * 0.6); g.addColorStop(0, 'rgba(255,196,107,.25)'); g.addColorStop(1, 'rgba(255,196,107,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    draw(ctx, id, w / 2, h / 2 + 2, Math.min(w, h) / 190, 0, 0, look, logo, face);
  }

  // adoption day: the chosen ride rolls out of the shelter, with the pet looking out, to a house with a warm window
  function liftoff(cv, id, faceSrc, label, done, look, logo) {
    var ctx = cv.getContext('2d'), face = new Image(), t0 = 0, raf = 0, stop = false, W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    face.src = faceSrc || '';
    var rnd = function (i) { var s = Math.sin(i * 127.1) * 43758.5453; return s - Math.floor(s); };
    function size() { W = cv.clientWidth || window.innerWidth; H = cv.clientHeight || window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; }
    size();
    function heart(x, y, s, a) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#ff6f8a'; ctx.beginPath(); ctx.moveTo(x, y + s * 0.4); ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.5, y - s * 1.1, x, y - s * 0.5); ctx.bezierCurveTo(x + s * 0.5, y - s * 1.1, x + s, y - s * 0.4, x, y + s * 0.4); ctx.fill(); ctx.restore(); }
    function frame(ts) {
      if (stop) return; if (!t0) t0 = ts; var e = (ts - t0) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var bg = ctx.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#2a1d3c'); bg.addColorStop(0.55, '#b0506a'); bg.addColorStop(1, '#ffb070'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < 50; i++) { ctx.fillStyle = 'rgba(255,255,255,' + (0.2 + rnd(i + 3) * 0.5) + ')'; ctx.fillRect(rnd(i + 1) * W, rnd(i + 40) * H * 0.5, 1.6, 1.6); }
      var ground = H * 0.76, sc = Math.min(1.5, H / 420);
      ctx.fillStyle = '#5a3a52'; ctx.beginPath(); ctx.moveTo(0, ground - 30); ctx.quadraticCurveTo(W * 0.3, ground - 90, W * 0.6, ground - 34); ctx.quadraticCurveTo(W * 0.85, ground - 6, W, ground - 50); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
      ctx.fillStyle = '#3c2a46'; ctx.fillRect(0, ground, W, H - ground); ctx.fillStyle = 'rgba(255,230,190,.35)'; for (var d = 0; d < 14; d++) ctx.fillRect(d * W / 13 + ((e * 40) % 40) * 0.0, ground + 26 * sc, 28 * sc, 3);
      // the shelter on the left and the house on the right
      var sx = W * 0.1, hx = W * 0.86;
      ctx.fillStyle = '#7a5a6a'; ctx.fillRect(sx - 70 * sc, ground - 110 * sc, 140 * sc, 110 * sc); ctx.fillStyle = '#a06a58'; ctx.beginPath(); ctx.moveTo(sx - 84 * sc, ground - 110 * sc); ctx.lineTo(sx, ground - 160 * sc); ctx.lineTo(sx + 84 * sc, ground - 110 * sc); ctx.fill();
      ctx.fillStyle = '#3a2a40'; ctx.fillRect(sx - 18 * sc, ground - 52 * sc, 36 * sc, 52 * sc); heart(sx, ground - 100 * sc, 14 * sc, 1);
      ctx.fillStyle = '#c28a62'; ctx.fillRect(hx - 62 * sc, ground - 90 * sc, 124 * sc, 90 * sc); ctx.fillStyle = '#d65a4a'; ctx.beginPath(); ctx.moveTo(hx - 76 * sc, ground - 90 * sc); ctx.lineTo(hx, ground - 146 * sc); ctx.lineTo(hx + 76 * sc, ground - 90 * sc); ctx.fill();
      var glow = ctx.createRadialGradient(hx - 30 * sc, ground - 56 * sc, 2, hx - 30 * sc, ground - 56 * sc, 40 * sc); glow.addColorStop(0, 'rgba(255,230,150,1)'); glow.addColorStop(1, 'rgba(255,200,100,.2)'); ctx.fillStyle = glow; ctx.fillRect(hx - 48 * sc, ground - 74 * sc, 36 * sc, 36 * sc);
      ctx.fillStyle = '#5a3a30'; ctx.fillRect(hx + 12 * sc, ground - 48 * sc, 30 * sc, 48 * sc);
      // the ride: waits, then drives from the shelter to the house
      var go = e < 3 ? 0 : Math.min(1, (e - 3) / 3.4), ease = go * go * (3 - 2 * go), x = sx + 40 * sc + (hx - 40 * sc - (sx + 40 * sc)) * ease, y = ground + 6 * sc;
      draw(ctx, id, x, y - 30 * sc, sc * 1.05, go > 0 && go < 1 ? 1 : 0, e, look, logo, face);
      var arrived = go >= 1; if (arrived) for (var k = 0; k < 9; k++) { var q = (e - 6.4) * 0.8 + rnd(k) * 0.4; heart(hx - 30 * sc + (rnd(k + 5) - 0.5) * 120 * sc, ground - 120 * sc - ((q * 90 * sc) % (90 * sc)), (8 + rnd(k + 9) * 8) * sc, Math.max(0, 1 - ((q * 90 * sc) % (90 * sc)) / (90 * sc))); }
      ctx.textAlign = 'center'; ctx.fillStyle = '#ffd98a'; ctx.font = '600 22px "JetBrains Mono", monospace';
      ctx.fillText(e < 3 ? ['READY', 'READY', 'SET', 'GO!'][Math.min(3, Math.floor(e))] + (e < 3 ? '…' : '') : (arrived ? 'ADOPTED!' : 'ON THE WAY…'), W / 2, 56);
      ctx.fillStyle = '#fff4de'; ctx.font = '600 18px Inter, sans-serif'; ctx.fillText(label || '', W / 2, 88);
      if (e > 7.4) { stop = true; if (done) done(); return; }
      raf = window.requestAnimationFrame(frame);
    }
    raf = window.requestAnimationFrame(frame);
    return { stop: function () { stop = true; window.cancelAnimationFrame(raf); } };
  }
  root.Ships = { list: SHIPS, HULLS: HULLS, ACCENTS: ACCENTS, SUITS: SUITS, draw: draw, thumb: thumb, liftoff: liftoff, isShip: function (v) { return ids.indexOf(v) >= 0; } };
})(typeof window !== 'undefined' ? window : module.exports);
