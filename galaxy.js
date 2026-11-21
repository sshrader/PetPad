'use strict';
// The galaxy on the home page: every launched coin is a ship flying its own orbit around a small sun, with its ticker and pet.
// Hover a ship to slow it and read its card; click (or tap twice on a phone) to open the coin page. Plain 2D canvas, original art.
(function (root) {
  var CY = '#4de3ff', VI = '#9d7bff', MG = '#ff4fd8', GOLD = '#ffd98a';
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
        c.look = r.look || null; c.logoImg = r.logo ? portrait('/images/' + r.logo + '.png') : null; c.call = r.call || '';
        c.mint = r.mint; c.name = r.name || ('$' + r.symbol); c.sym = r.symbol; c.ship = r.ship || 'nova'; c.agent = r.agent || 'Pet'; c.at = r.at; c.bear = r.bear; c.flag = r.bear === 'F';
        c.lane = c.flag ? 0 : 1 + lane + ring * 0.55; c.dir = i % 2 ? -1 : 1; c.speed = (0.20 - 0.022 * c.lane) * c.dir; c.tilt = (rnd(i + 11) - 0.5) * 0.7;
        c.face = portrait(c.flag ? '/api/founder.png?v=astro' : '/api/preview/' + r.bear + '.png?v=astro');
        return c;
      });
      if (selected && !coins.some(function (c) { return c.mint === selected; })) selected = null;
      if (reduce) self.draw();
    };
    function place(c, t) {
      var cx = W / 2, cy = H / 2 + 6, k = Math.min(W, H * 2.1), rx = k * (0.12 + 0.052 * c.lane), ry = Math.max(34, rx * 0.36);
      var th = c.th + t * c.speed, ex = Math.cos(th) * rx, ey = Math.sin(th) * ry;
      var ct = Math.cos(c.tilt), st = Math.sin(c.tilt);
      c.x = cx + ex * ct - ey * st; c.y = cy + ex * st + ey * ct;
      var vx = -Math.sin(th) * rx * c.dir, vy = Math.cos(th) * ry * c.dir;
      var hx = vx * ct - vy * st, hy = vx * st + vy * ct;
      c.head = Math.atan2(hy, hx) + Math.PI / 2; c.depth = Math.sin(th);
      c.sc = (c.flag ? 0.52 : 0.38) + 0.1 * c.depth;
    }
    function bg(t) {
      var g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#03040c'); g.addColorStop(0.55, '#0a0b26'); g.addColorStop(1, '#150b32'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-0.38);
      var b = ctx.createLinearGradient(0, -H * 0.5, 0, H * 0.5); b.addColorStop(0, 'rgba(150,140,255,0)'); b.addColorStop(0.5, 'rgba(230,215,255,.17)'); b.addColorStop(1, 'rgba(150,140,255,0)'); ctx.fillStyle = b; ctx.fillRect(-W, -H * 0.5, W * 2, H);
      ctx.restore();
      glow(W * 0.18, H * 0.3, H * 0.7, '157,123,255', 0.14); glow(W * 0.85, H * 0.78, H * 0.8, '255,79,216', 0.1); glow(W * 0.74, H * 0.18, H * 0.5, '77,227,255', 0.08);
      for (var i = 0; i < STARS.length; i++) {
        var s = STARS[i], x = ((s.x * W + px * s.z * 14 + T * s.z * 2) % W + W) % W, y = s.y * H + py * s.z * 8, a = 0.3 + 0.6 * s.z * (0.6 + 0.4 * Math.sin(t * (0.5 + s.z) + s.p));
        ctx.globalAlpha = Math.min(1, a); ctx.fillStyle = '#fff'; var r = 0.5 + s.z * 0.9; ctx.fillRect(x, y, r, r);
      }
      ctx.globalAlpha = 1;
    }
    function glow(x, y, r, rgb, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(' + rgb + ',' + a + ')'); g.addColorStop(1, 'rgba(' + rgb + ',0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); }
    function sunAndLanes() {
      var cx = W / 2, cy = H / 2 + 6, k = Math.min(W, H * 2.1);
      ctx.lineWidth = 1;
      for (var l = 1; l <= 7; l++) { var rx = k * (0.12 + 0.052 * l); ctx.strokeStyle = 'rgba(170,182,232,' + (0.1 - l * 0.008) + ')'; ctx.beginPath(); ctx.ellipse(cx, cy, rx, Math.max(34, rx * 0.36), 0, 0, 7); ctx.stroke(); }
      glow(cx, cy, 120, '255,200,120', 0.5); glow(cx, cy, 36, '255,240,200', 0.95);
    }
    function drawCoin(c, t) {
      var act = hover === c || selected === c.mint;
      ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.head);
      if (c.flag) { var g = ctx.createRadialGradient(0, 0, 4, 0, 0, 90 * c.sc * 2.4); g.addColorStop(0, 'rgba(255,217,138,.4)'); g.addColorStop(1, 'rgba(255,217,138,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 90 * c.sc * 2.4, 0, 7); ctx.fill(); }
      if (act) { ctx.strokeStyle = CY; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -8 * c.sc, 74 * c.sc * 1.15, 0, 7); ctx.stroke(); }
      root.Ships.draw(ctx, c.ship, 0, 0, c.sc * (act ? 1.12 : 1), 0.55, t + c.th * 9, c.look, c.logoImg);
      ctx.restore();
      // ticker label with the pet, kept upright under the ship
      var ly = c.y + 52 * c.sc + 18, label = '$' + c.sym, w;
      ctx.font = '500 12px "JetBrains Mono", monospace'; w = ctx.measureText(label).width + 34;
      ctx.fillStyle = act ? 'rgba(10,13,34,.95)' : 'rgba(5,6,15,.7)'; ctx.strokeStyle = act ? CY : (c.flag ? GOLD : 'rgba(157,123,255,.55)'); ctx.lineWidth = 1;
      rr(c.x - w / 2, ly - 11, w, 22, 11); ctx.fill(); ctx.stroke();
      if (c.face && c.face.complete && c.face.naturalWidth) { ctx.save(); ctx.beginPath(); ctx.arc(c.x - w / 2 + 12, ly, 9, 0, 7); ctx.clip(); ctx.drawImage(c.face, c.x - w / 2 + 3, ly - 9, 18, 18); ctx.restore(); }
      ctx.fillStyle = c.flag ? GOLD : '#eef2ff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(label, c.x - w / 2 + 26, ly + 0.5);
    }
    function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
    function shoot(t) {
      for (var i = 0; i < 2; i++) { var ph = (t * 0.17 + i * 0.5) % 1.7; if (ph > 0.3) continue; var k = ph / 0.3, x = W * (0.9 - i * 0.35) - k * W * 0.4, y = H * (0.1 + i * 0.25) + k * H * 0.3, a = Math.sin(k * Math.PI);
        var g = ctx.createLinearGradient(x, y, x + 120, y - 70); g.addColorStop(0, 'rgba(255,255,255,' + a + ')'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 120, y - 70); ctx.stroke(); }
    }
    self.draw = function (t) {
      t = t || 0; size(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); bg(t); sunAndLanes(); shoot(t);
      coins.forEach(function (c) { place(c, T); });
      var order = coins.slice().sort(function (a, b) { return a.depth - b.depth; });
      order.forEach(function (c) { drawCoin(c, t); });
      if (loaded && !coins.length) { ctx.fillStyle = 'rgba(238,242,255,.9)'; ctx.font = '600 18px Inter, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('The sky is empty. Launch the first ship.', W / 2, H / 2 + 80); }
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
