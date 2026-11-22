'use strict';
// The yard on the home page: every launched coin is a pet riding along its own path through the shelter yard, with its ticker.
// Hover a ride to slow it and read its card; click (or tap twice on a phone) to open the coin page. Plain 2D canvas, original art.
(function (root) {
  var CY = '#ffc46b', VI = '#ff8a7a', MG = '#ff6f8a', GOLD = '#ffd98a';
  var reduce = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);
  function rnd(i) { var s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
  var STARS = []; for (var i = 0; i < 220; i++) STARS.push({ x: rnd(i), y: rnd(i + 500), z: 0.25 + rnd(i + 900) * 0.9, p: rnd(i + 1300) * 6.28 });
  function ago(t) { var s = Math.max(1, Math.round((Date.now() - t) / 1000)); if (s < 90) return s + ' s ago'; var m = Math.round(s / 60); if (m < 90) return m + ' min ago'; var h = Math.round(m / 60); if (h < 36) return h + ' h ago'; return Math.round(h / 24) + ' d ago'; }

  function Galaxy(cv, tip, opts) {
    opts = opts || {};
    var ctx = cv.getContext('2d'), self = this, loaded = false, coins = [], imgs = {}, W = 0, H = 0, dpr = 1, raf = 0, on = false, last = 0, T = 0;
    var mx = -999, my = -999, hover = null, selected = null, px = 0, py = 0;
    function portrait(src) { if (!imgs[src]) { var im = new Image(); im.src = src; imgs[src] = im; } return imgs[src]; }
    function size() {
      dpr = Math.min(root.devicePixelRatio || 1, 2); W = cv.clientWidth || 800; H = cv.clientHeight || 400;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    }
    // each coin gets a lane: its own ellipse, tilt, speed and direction
    self.setCoins = function (list) {
      loaded = true;
      var keep = {}; coins.forEach(function (c) { keep[c.mint] = c; });
      coins = (list || []).slice(0, 24).map(function (r, i) {
        var o = keep[r.mint], lane = i % 6, ring = Math.floor(i / 6);
        var c = o || { th: rnd(i + 3) * 6.28 };
        c.look = r.look || null; c.logoImg = r.logo && r.custom ? portrait('/images/' + r.logo + '.png') : null; c.call = r.call || '';
        c.mint = r.mint; c.name = r.name || ('$' + r.symbol); c.sym = r.symbol; c.ship = r.ship || 'van'; c.agent = r.agent || 'Pet'; c.at = r.at; c.bear = r.bear; c.flag = r.bear === 'F';
        c.lane = c.flag ? 0 : 1 + lane + ring * 0.55; c.dir = i % 2 ? -1 : 1; c.speed = Math.max(0.07, 0.16 - 0.012 * c.lane); c.tilt = (rnd(i + 11) - 0.5) * 0.7;
        c.face = portrait(c.flag ? '/api/founder.png?v=pets' : '/api/preview/' + r.bear + '.png?v=pets');
        return c;
      });
      if (selected && !coins.some(function (c) { return c.mint === selected; })) selected = null;
      if (reduce) self.draw();
    };
    function place(c, t) {
      var span = W + 200, u = ((c.th / 6.28 + t * c.speed * 0.5) % 1 + 1) % 1;
      c.x = c.dir > 0 ? -100 + u * span : W + 100 - u * span;
      var base = H * 0.52 + c.lane * H * 0.055; c.y = base + (c.flag ? 0 : Math.sin(c.th * 5 + t * 0.6) * 2);
      c.depth = c.lane; c.sc = (c.flag ? 0.9 : 0.55 + 0.04 * c.lane);
    }
    function bg(t) {
      var hz = H * 0.42, g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, '#2a1d3c'); g.addColorStop(0.55, '#b0506a'); g.addColorStop(1, '#ffb070'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz + 2);
      glow(W * 0.78, hz - 6, H * 0.5, '255,214,150', 0.5); ctx.fillStyle = '#ffe9b8'; ctx.beginPath(); ctx.arc(W * 0.78, hz - 6, 26, 0, 7); ctx.fill();
      for (var i = 0; i < STARS.length / 4; i++) { var s = STARS[i]; ctx.globalAlpha = 0.25 + 0.4 * s.z; ctx.fillStyle = '#fff'; ctx.fillRect(s.x * W, s.y * hz * 0.7, 1.4, 1.4); }
      ctx.globalAlpha = 0.55; ctx.fillStyle = '#ffe1d0'; for (var c2 = 0; c2 < 4; c2++) { var cx = ((c2 * 0.29 + T * 0.004 + 0.1) % 1.2 - 0.1) * W, cy = hz * (0.25 + 0.14 * (c2 % 3)); ctx.beginPath(); ctx.ellipse(cx, cy, 54, 12, 0, 0, 7); ctx.ellipse(cx + 26, cy - 8, 32, 11, 0, 0, 7); ctx.ellipse(cx - 28, cy - 4, 28, 9, 0, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
      ctx.fillStyle = '#6a3f58'; ctx.beginPath(); ctx.moveTo(0, hz); ctx.quadraticCurveTo(W * 0.2, hz - 36, W * 0.45, hz - 6); ctx.quadraticCurveTo(W * 0.7, hz - 40, W, hz - 4); ctx.lineTo(W, hz + 4); ctx.lineTo(0, hz + 4); ctx.fill();
      // the shelter (left) with a heart sign, and a house (right)
      var sx = W * 0.09, sh = Math.min(70, H * 0.17); ctx.fillStyle = '#8a6070'; ctx.fillRect(sx - sh * 0.9, hz - sh, sh * 1.8, sh + 6); ctx.fillStyle = '#b07058'; ctx.beginPath(); ctx.moveTo(sx - sh * 1.05, hz - sh); ctx.lineTo(sx, hz - sh * 1.55); ctx.lineTo(sx + sh * 1.05, hz - sh); ctx.fill();
      ctx.fillStyle = '#3a2a40'; ctx.fillRect(sx - sh * 0.2, hz - sh * 0.5, sh * 0.4, sh * 0.56); ctx.fillStyle = '#ff8aa0'; ctx.beginPath(); var hy = hz - sh * 0.98, hs = sh * 0.22; ctx.moveTo(sx, hy + hs * 0.4); ctx.bezierCurveTo(sx - hs, hy - hs * 0.4, sx - hs * 0.5, hy - hs * 1.1, sx, hy - hs * 0.5); ctx.bezierCurveTo(sx + hs * 0.5, hy - hs * 1.1, sx + hs, hy - hs * 0.4, sx, hy + hs * 0.4); ctx.fill();
      var hx = W * 0.9, hh = sh * 0.8; ctx.fillStyle = '#c28a62'; ctx.fillRect(hx - hh, hz - hh, hh * 2, hh + 6); ctx.fillStyle = '#d65a4a'; ctx.beginPath(); ctx.moveTo(hx - hh * 1.2, hz - hh); ctx.lineTo(hx, hz - hh * 1.6); ctx.lineTo(hx + hh * 1.2, hz - hh); ctx.fill(); ctx.fillStyle = '#ffe08a'; ctx.fillRect(hx - hh * 0.6, hz - hh * 0.7, hh * 0.45, hh * 0.45);
      // grass, dirt lanes and a fence
      var gg = ctx.createLinearGradient(0, hz, 0, H); gg.addColorStop(0, '#4a7a58'); gg.addColorStop(1, '#2a5240'); ctx.fillStyle = gg; ctx.fillRect(0, hz + 2, W, H - hz);
      ctx.fillStyle = 'rgba(210,170,120,.22)'; for (var l = 1; l <= 7; l++) { ctx.fillRect(0, H * 0.52 + l * H * 0.055 + 8, W, 5); }
      ctx.fillStyle = '#e8d2b0'; for (var f = 0; f < W; f += 26) { ctx.fillRect(f, hz + 4, 5, 20); } ctx.fillRect(0, hz + 10, W, 3);
      for (var q = 0; q < 14; q++) { ctx.fillStyle = 'rgba(255,255,255,.18)'; var px2 = rnd(q + 3) * W, py2 = hz + 30 + rnd(q + 9) * (H - hz - 40); ctx.beginPath(); ctx.ellipse(px2, py2, 5, 4, 0, 0, 7); ctx.fill(); [[-6, -6], [-2, -9], [2, -9], [6, -6]].forEach(function (d) { ctx.beginPath(); ctx.ellipse(px2 + d[0], py2 + d[1], 2, 2.6, 0, 0, 7); ctx.fill(); }); }
    }
    function glow(x, y, r, rgb, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    function drawCoin(c, t) {
      var act = hover === c || selected === c.mint;
      ctx.save(); ctx.translate(c.x, c.y);
      if (c.flag) { var g = ctx.createRadialGradient(0, 0, 4, 0, 0, 90 * c.sc * 2.4); g.addColorStop(0, 'rgba(255,217,138,.45)'); g.addColorStop(1, 'rgba(255,217,138,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 90 * c.sc * 2.4, 0, 7); ctx.fill(); }
      if (act) { ctx.strokeStyle = CY; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 4 * c.sc, 74 * c.sc * 1.15, 52 * c.sc * 1.15, 0, 0, 7); ctx.stroke(); }
      root.Ships.draw(ctx, c.ship, 0, 0, c.sc * (act ? 1.1 : 1), 1, t + c.th * 9, c.look, c.logoImg, c.face, c.dir < 0);
      ctx.restore();
      var ly = c.y + 44 * c.sc + 14, label = '$' + c.sym, w;
      ctx.font = '500 12px "JetBrains Mono", monospace'; w = ctx.measureText(label).width + 16;
      ctx.fillStyle = act ? 'rgba(58,36,56,.95)' : 'rgba(58,36,56,.75)'; ctx.strokeStyle = act ? CY : (c.flag ? GOLD : 'rgba(255,196,107,.55)'); ctx.lineWidth = 1;
      rr(c.x - w / 2, ly - 11, w, 22, 11); ctx.fill(); ctx.stroke();
      ctx.fillStyle = c.flag ? GOLD : '#fff4de'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, c.x, ly + 0.5);
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    self.draw = function (t) {
      t = t || 0; size(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); bg(t);
      coins.forEach(function (c) { place(c, T); });
      var order = coins.slice().sort(function (a, b) { return a.depth - b.depth; });
      order.forEach(function (c) { drawCoin(c, t); });
      if (loaded && !coins.length) { ctx.fillStyle = 'rgba(238,242,255,.9)'; ctx.font = '600 18px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('The yard is empty. Launch the first pet.', W / 2, H / 2 + 80); }
      // hit test and tooltip
      var best = null, bd = 1e9; coins.forEach(function (c) { var d = Math.hypot(c.x - mx, c.y - my); if (d < 40 * (c.sc / 0.3 > 1.2 ? 1.2 : 1) && d < bd) { bd = d; best = c; } });
      if (best !== hover) { hover = best; cv.style.cursor = hover ? 'pointer' : 'default'; }
      var show = hover || coins.filter(function (c) { return c.mint === selected; })[0];
      if (show && tip) {
        tip.hidden = false; if (tip.getAttribute('data-m') !== show.mint) { tip.setAttribute('data-m', show.mint); tip.textContent = ''; var b = document.createElement('b'); b.textContent = show.name; var s1 = document.createElement('span'); s1.textContent = '$' + show.sym + ' · ' + ago(show.at); var s2 = document.createElement('span'); s2.className = 'g'; var sp = root.Ships.list.filter(function (x) { return x.id === show.ship; })[0]; s2.textContent = (sp ? sp.name : 'Ship') + ' · ' + (show.call || show.agent); var s3 = document.createElement('span'); s3.className = 'o'; s3.textContent = 'Click to open'; tip.appendChild(b); tip.appendChild(s1); tip.appendChild(s2); tip.appendChild(s3); }
        var tw = tip.offsetWidth || 170, tx = Math.min(W - tw - 8, Math.max(8, show.x + 28)), ty = Math.max(8, Math.min(H - 90, show.y - 40)); tip.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
      } else if (tip) { tip.hidden = true; tip.removeAttribute('data-m'); }
    };
    function tick(ts) {
      if (!on) return; raf = root.requestAnimationFrame(tick);
      if (ts - last < 33) return; var dt = last ? Math.min(0.1, (ts - last) / 1000) : 0.033; last = ts;
      var slow = hover ? 0.12 : 1; T += dt * slow; px += ((mx > -900 ? (mx / W - 0.5) : 0) - px) * 0.05; py += ((my > -900 ? (my / H - 0.5) : 0) - py) * 0.05;
      self.draw(ts / 1000);
    }
    function pos(e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; }
    cv.addEventListener('pointermove', function (e) { pos(e); });
    cv.addEventListener('pointerleave', function () { mx = my = -999; });
    cv.addEventListener('pointerdown', function (e) { pos(e); if (e.pointerType !== 'mouse') self.draw(last / 1000); });
    cv.addEventListener('click', function (e) {
      pos(e); self.draw(last / 1000); var h = hover; if (!h) { selected = null; return; }
      if (e.pointerType === 'touch' || (root.matchMedia && root.matchMedia('(hover: none)').matches)) { if (selected !== h.mint) { selected = h.mint; self.draw(last / 1000); return; } }
      (opts.open || function (m) { root.location.href = '/coin/' + m; })(h.mint);
    });
    root.addEventListener('resize', function () { if (!on) self.draw(last / 1000); });
    root.document.addEventListener('visibilitychange', function () { if (root.document.hidden) { if (on) root.cancelAnimationFrame(raf); } else if (on) { raf = root.requestAnimationFrame(tick); } });
    self.start = function () { if (on) return; if (reduce) { self.draw(0); return; } on = true; raf = root.requestAnimationFrame(tick); };
    self.stop = function () { on = false; root.cancelAnimationFrame(raf); };
  }
  root.Galaxy = Galaxy;
  Galaxy.ago = ago;
})(window);
