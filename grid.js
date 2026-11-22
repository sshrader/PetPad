'use strict';
// The pets for PetPaws: eight original shelter pets (dogs and cats) drawn as 48 x 48 adoption portraits, plus a one-of-one flagship, Titan.
// Everything is drawn here with a tiny rasterizer and a PNG encoder: no libraries, no image files.
const crypto = require('crypto');
const { encodePng } = require('./isorender');

const N = 48;
const INK = '#141018';

// ---- the eight pets: each has four coats. The keys keep the old class names so every ability still works ----
// fur is [light, shade]; mask is the muzzle/face colour; mark is the pattern colour; eye is the eye colour; suit/trim colour the little space suit
const mk = (list) => list.map((l, i) => Object.assign({ idx: i }, l));
const coat = (n, fur, mask, mark, eye, suit, trim) => ({ n, fur, mask, mark, eye, suit: suit || '#e9ecf6', trim: trim || '#ff7a2e', glass: '#a8e8ff' });
const SPECIES = {
  ranger: { name: 'Shiba', kind: 'shiba', pet: 'dog', w: 14, looks: mk([
    coat('Red coat', ['#e0884a', '#b9602e'], '#f6ead8', '#f2d3a0', '#3a2418', '#ff7a2e', '#ffffff'), coat('Sesame coat', ['#a8785a', '#6f4a36'], '#efe2cc', '#d8b890', '#3a2418', '#1f9a9a', '#ffd98a'),
    coat('Black and tan', ['#3a3438', '#1e1a20'], '#c98e58', '#d8a070', '#2a1a12', '#5b3fd0', '#4de3ff'), coat('Cream coat', ['#f1dcb4', '#d8b884'], '#fbf3e4', '#f6e2bc', '#3a2418', '#e9ecf6', '#ff7a2e')]) },
  pilot: { name: 'Corgi', kind: 'corgi', pet: 'dog', w: 14, looks: mk([
    coat('Red and white', ['#e89a4a', '#bf6a2a'], '#fbf3e4', '#ffffff', '#3a2418', '#c8383f', '#ffffff'), coat('Tricolor', ['#d9904a', '#a8602a'], '#fbf3e4', '#2a1e1c', '#3a2418', '#3a6ad0', '#ffd98a'),
    coat('Sable', ['#b87a48', '#7a4a2a'], '#f4e8d4', '#ffffff', '#3a2418', '#1f9a9a', '#ffffff'), coat('Fawn', ['#e8c48c', '#c49a5c'], '#fbf3e4', '#ffffff', '#3a2418', '#f2c230', '#2a2a34')]) },
  engineer: { name: 'Pug', kind: 'pug', pet: 'dog', w: 14, looks: mk([
    coat('Fawn coat', ['#e6c590', '#c29a62'], '#3a2e30', '#2a2024', '#2a1a12', '#f2c230', '#2a2a34'), coat('Black coat', ['#3a3438', '#1e1a20'], '#22181c', '#18121a', '#2a1a12', '#7a8094', '#f2c230'),
    coat('Apricot coat', ['#efb27c', '#c8844e'], '#4a3030', '#32201e', '#2a1a12', '#3f8a5a', '#f2c230'), coat('Silver coat', ['#c9c4c8', '#948e96'], '#3a3438', '#2a2428', '#2a1a12', '#3a6ad0', '#f2c230')]) },
  navigator: { name: 'Husky', kind: 'husky', pet: 'dog', w: 14, looks: mk([
    coat('Grey and white', ['#8a909c', '#5a606c'], '#f6f6fa', '#4a505c', '#6ab8e8', '#5b3fd0', '#4de3ff'), coat('Black and white', ['#34343c', '#1c1c24'], '#f6f6fa', '#22222a', '#6ab8e8', '#1a8f8f', '#ffffff'),
    coat('Red and white', ['#b86a48', '#8a4a30'], '#f6efe8', '#9a5a3a', '#9a6a3a', '#b0309a', '#4de3ff'), coat('Pure white', ['#f2f4fa', '#c8ccdc'], '#ffffff', '#d4d8e6', '#6ab8e8', '#2a2e4a', '#4de3ff')]) },
  commander: { name: 'Akita', kind: 'akita', pet: 'dog', w: 14, looks: mk([
    coat('Fawn and white', ['#d49a5c', '#a86e38'], '#f8eedc', '#ffffff', '#2a1a12', '#e9ecf6', '#e8b82e'), coat('Brindle', ['#7a5438', '#3a2418'], '#f0e2c8', '#2a1a12', '#2a1a12', '#27335f', '#ffd98a'),
    coat('Pinto', ['#e8dccc', '#c8b8a0'], '#ffffff', '#b86a3a', '#2a1a12', '#6a1e3a', '#e8b82e'), coat('Silver', ['#b8b4b0', '#807a78'], '#f4f0ec', '#5a5658', '#2a1a12', '#1c1c2e', '#c9d2ff')]) },
  observer: { name: 'Siamese', kind: 'siamese', pet: 'cat', w: 14, looks: mk([
    coat('Seal point', ['#eadbc4', '#cdb898'], '#4a3630', '#3a2a26', '#4aa8f0', '#dfe4f2', '#4fb89a'), coat('Blue point', ['#e4e6ee', '#c0c4d2'], '#6a7488', '#586278', '#4aa8f0', '#4fb89a', '#ffffff'),
    coat('Chocolate point', ['#f2e6d4', '#d8c4a4'], '#7a5a4a', '#6a4a3c', '#4aa8f0', '#9a86e0', '#ffffff'), coat('Flame point', ['#f4e2c8', '#dcc09c'], '#d8854a', '#c8743a', '#4aa8f0', '#8a96b4', '#4de3ff')]) },
  trooper: { name: 'Black Cat', kind: 'blackcat', pet: 'cat', w: 14, looks: mk([
    coat('Midnight coat', ['#34303a', '#1a181e'], '#2a262e', '#3a3640', '#ffd23a', '#4a4e5e', '#ff9a5c'), coat('Smoke coat', ['#5a5660', '#38343e'], '#46424c', '#6a6670', '#9adf4a', '#22222c', '#ff4fd8'),
    coat('Tuxedo coat', ['#2c2830', '#16141a'], '#f4f2f6', '#f4f2f6', '#ffd23a', '#3c5a3a', '#c9b458'), coat('Cream and black', ['#34303a', '#1a181e'], '#e8dcc8', '#e8dcc8', '#ffd23a', '#7a2430', '#e9ecf6')]) },
  scientist: { name: 'Tabby', kind: 'tabby', pet: 'cat', w: 14, looks: mk([
    coat('Orange tabby', ['#ee9a4a', '#c8702a'], '#f8e6cc', '#b8581e', '#7ac84a', '#f2f4fa', '#9d7bff'), coat('Grey tabby', ['#9a9ca8', '#6a6c78'], '#e8e8ee', '#4a4c58', '#e8c23a', '#7fb4e8', '#ffffff'),
    coat('Brown tabby', ['#8a6a48', '#5a4028'], '#e6d4b8', '#3a2818', '#7ac84a', '#e89ac8', '#ffffff'), coat('Calico', ['#f6f2ee', '#d8d0c8'], '#ffffff', '#e8964a', '#7ac84a', '#9ac84a', '#2a2a34')]) },
};
const ACCS = [['none', 22], ['bandana', 16], ['bowtie', 12], ['bell', 12], ['flower', 10], ['sunnies', 12], ['partyhat', 10]];
const ACC_COL = ['#ff5d7a', '#4de3ff', '#ffd98a', '#9d7bff', '#7cf0a8', '#ff9a5c', '#ffffff'];
const BGS = ['#4a3550', '#2f4a56', '#58402f', '#2f5248'];
const NAMES = ['MOCHI', 'BISCUIT', 'NUGGET', 'WAFFLES', 'PICKLES', 'MAPLE', 'TOFU', 'BEANS', 'ZIGGY', 'PEANUT', 'BUTTONS', 'CHEWY', 'MISO', 'OREO', 'PIXEL', 'TAKO', 'KIWI', 'DONUT', 'COOKIE', 'SPROUT', 'MOCHA', 'BAGEL', 'TURNIP', 'NOODLE', 'PRETZEL', 'SUSHI', 'MUFFIN', 'GIZMO', 'BISCOTTI', 'CUPCAKE', 'ROCKET', 'COMET', 'LUNA', 'ORBIT', 'STARLA', 'PLUTO', 'NEBULA', 'PIPPIN', 'BOLT', 'SNICKERS'];

// ---- classes: each is an ability that works from real chain numbers (fn names the report in report.js) ----
const ROLES = {
  RANGER: { fn: 'HUNTER', blurb: 'Scouts the launch block and spots the wallets that rushed in first.' },
  PILOT: { fn: 'COURIER', blurb: 'Keeps the flight log: the coin’s best days on record.' },
  ENGINEER: { fn: 'AUDITOR', blurb: 'Won’t fly a coin until the mint and freeze authority are revoked.' },
  NAVIGATOR: { fn: 'SCOUT', blurb: 'Plots the chain and counts every wallet holding the coin.' },
  COMMANDER: { fn: 'ARCHIVIST', blurb: 'Keeps the mission log of every milestone the coin hits.' },
  OBSERVER: { fn: 'SENTRY', blurb: 'Never takes their eyes off the dev wallet.' },
  TROOPER: { fn: 'WARDEN', blurb: 'Works out how hard a big sale would hit the curve.' },
  SCIENTIST: { fn: 'ANALYST', blurb: 'Tracks the market cap against the start and the peak.' },
};
const ABILITIES = {
  NAVIGATOR: { name: 'Holder Radar', fn: 'SCOUT', does: 'Tracks how many wallets hold the coin and how that count has changed since it first looked.' },
  COMMANDER: { name: 'Milestone Log', fn: 'ARCHIVIST', does: 'Writes down the moment the coin first passes 25%, 50%, 75% and 90% of the curve, and when it graduates.' },
  RANGER: { name: 'Launch Block Scan', fn: 'HUNTER', does: 'Finds the wallets that bought in the same block as the launch or the next, and how much of the supply they hold now.' },
  PILOT: { name: 'Record Board', fn: 'COURIER', does: 'Keeps the coin’s records: its highest market cap, most holders and furthest curve progress, with when each was seen.' },
  OBSERVER: { name: 'Dev Watch', fn: 'SENTRY', does: 'Watches the dev wallet and the top ten holders, and sounds the alarm if the dev’s share drops.' },
  SCIENTIST: { name: 'Cap Tracker', fn: 'ANALYST', does: 'Follows market cap against where it started and where it peaked, and shows how far it is from the high.' },
  ENGINEER: { name: 'Authority Audit', fn: 'AUDITOR', does: 'Reads the token itself and says whether its mint authority and freeze authority are revoked.' },
  TROOPER: { name: 'Sell Impact', fn: 'WARDEN', does: 'Uses the curve’s real reserves to work out what would happen if the dev or the biggest holder sold everything right now.' },
  FLAGSHIP: { name: 'Command Sweep', fn: 'FLAGSHIP', does: 'Runs every other pet’s ability on the coin at once and reports the headline from each.' },
};

function prng(seedBytes) {
  let a = seedBytes.readUInt32LE(0) ^ seedBytes.readUInt32LE(4);
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function pickW(list, r) { const tot = list.reduce((a, x) => a + x[1], 0); let t = r * tot; for (const x of list) { t -= x[1]; if (t < 0) return x; } return list[list.length - 1]; }

// ---- traits: the same look is never handed out twice in one set ----
const traitCache = new Map();
function traitsFor(slot, secret) {
  const ck = String(secret);
  let list = traitCache.get(ck);
  if (!list) { list = { rnd: prng(crypto.createHmac('sha256', ck).update('pets').digest()), items: [], seen: new Set(), names: new Set(), kinds: new Set() }; traitCache.set(ck, list); }
  const keys = Object.keys(SPECIES);
  list.used = list.used || {};
  while (list.items.length <= slot) {
    let t, key, tries = 0;
    do {
      // every pet breed is handed out once before any breed repeats
      const low = Math.min(...keys.map((x) => list.used[x] || 0)), pool = keys.filter((x) => (list.used[x] || 0) === low);
      const k = pickW(pool.map((x) => [x, SPECIES[x].w]), list.rnd())[0], look = Math.floor(list.rnd() * SPECIES[k].looks.length);
      t = { species: k, look, acc: pickW(ACCS, list.rnd())[0], accColor: Math.floor(list.rnd() * ACC_COL.length), bg: Math.floor(list.rnd() * 4), seed: Math.floor(list.rnd() * 1e9) };
      key = [k, look, t.acc, t.acc === 'none' ? 0 : t.accColor].join('|');
      tries++;
    } while ((list.seen.has(key) || (tries < 120 && list.kinds.has(t.species + t.look) && list.kinds.size < keys.length * 4)) && tries < 200);
    list.seen.add(key); list.kinds.add(t.species + t.look); list.used[t.species] = (list.used[t.species] || 0) + 1;
    let nm, nt = 0;
    do { nm = NAMES[Math.floor(list.rnd() * NAMES.length)]; nt++; } while (list.names.has(nm) && nt < 200);
    list.names.add(nm);
    t.name = nm; t.role = t.species.toUpperCase();
    list.items.push(t);
  }
  return list.items[slot];
}
function agentFor(slot, secret) {
  const t = traitsFor(slot, secret), sp = SPECIES[t.species];
  return { name: t.name, role: t.role, blurb: ROLES[t.role].blurb, ability: ABILITIES[t.role], chassis: sp.looks[t.look].n, breed: sp.name, pet: sp.pet, accessory: t.acc === 'none' ? null : t.acc };
}


// ---- a small vector painter: smooth shapes, soft shadows and gradients, 4 samples per pixel for clean edges ----
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const hx = (h) => { const n = parseInt(h.slice(1, 7), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const dk = (c, k) => [c[0] * k, c[1] * k, c[2] * k];
const lt = (c, k) => mix(c, [255, 255, 255], k);
const hash = (x, y) => { let h = Math.imul(x * 374761393 + y * 668265263, 1274126177); h = Math.imul(h ^ (h >>> 13), 1103515245); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function spline(pts, closed) {
  const out = [], n = pts.length, seg = 6;
  const g = (i) => pts[closed ? (i + n) % n : clamp(i, 0, n - 1)];
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
const inPoly = (pts) => (px, py) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const bbox = (pts) => { let a = 1e9, b = 1e9, c = -1e9, d = -1e9; for (const p of pts) { if (p[0] < a) a = p[0]; if (p[1] < b) b = p[1]; if (p[0] > c) c = p[0]; if (p[1] > d) d = p[1]; } return [a, b, c, d]; };

class Canvas {
  constructor(bg, R) { this.R = R || 384; this.K = this.R / N; const b = hx(bg); this.px = new Float32Array(this.R * this.R * 3); for (let i = 0; i < this.R * this.R; i++) { this.px[i * 3] = b[0]; this.px[i * 3 + 1] = b[1]; this.px[i * 3 + 2] = b[2]; } }
  // col is a hex string, an [r,g,b] array, or a function (x, y) returning [r,g,b] or [r,g,b,alpha] (null skips the point)
  paint(bb, test, col, a) {
    const K = this.K, R = this.R, fixed = typeof col === 'string' ? hx(col) : Array.isArray(col) ? col : null, A = a == null ? 1 : a;
    const x0 = Math.max(0, Math.floor(bb[0] * K) - 1), y0 = Math.max(0, Math.floor(bb[1] * K) - 1), x1 = Math.min(R - 1, Math.ceil(bb[2] * K) + 1), y1 = Math.min(R - 1, Math.ceil(bb[3] * K) + 1);
    for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) {
      let cov = 0;
      cov += test((px + 0.25) / K, (py + 0.25) / K) ? 1 : 0; cov += test((px + 0.75) / K, (py + 0.25) / K) ? 1 : 0; cov += test((px + 0.25) / K, (py + 0.75) / K) ? 1 : 0; cov += test((px + 0.75) / K, (py + 0.75) / K) ? 1 : 0;
      if (!cov) continue;
      let c = fixed, al = A * cov / 4;
      if (!c) { c = col((px + 0.5) / K, (py + 0.5) / K); if (!c) continue; if (c.length > 3) al *= c[3]; }
      const i = (py * R + px) * 3;
      this.px[i] += (c[0] - this.px[i]) * al; this.px[i + 1] += (c[1] - this.px[i + 1]) * al; this.px[i + 2] += (c[2] - this.px[i + 2]) * al;
    }
  }
  rect(x, y, w, h, col, a) { this.paint([x, y, x + w, y + h], (px, py) => px >= x && px < x + w && py >= y && py < y + h, col, a); }
  ell(cx, cy, rx, ry, col, a) { this.paint([cx - rx, cy - ry, cx + rx, cy + ry], (px, py) => ((px - cx) / rx) * ((px - cx) / rx) + ((py - cy) / ry) * ((py - cy) / ry) <= 1, col, a); }
  poly(pts, col, a, smooth) { const p = smooth ? spline(pts, true) : pts; this.paint(bbox(p), inPoly(p), col, a); }
  line(x1, y1, x2, y2, w, col, a) {
    const dx = x2 - x1, dy = y2 - y1, l2 = dx * dx + dy * dy, h = w / 2;
    this.paint([Math.min(x1, x2) - h, Math.min(y1, y2) - h, Math.max(x1, x2) + h, Math.max(y1, y2) + h], (px, py) => { let t = l2 ? ((px - x1) * dx + (py - y1) * dy) / l2 : 0; t = clamp(t, 0, 1); const qx = x1 + t * dx - px, qy = y1 + t * dy - py; return qx * qx + qy * qy <= h * h; }, col, a);
  }
  curve(pts, w, col, a) { const p = spline(pts, false); for (let i = 0; i < p.length - 1; i++) this.line(p[i][0], p[i][1], p[i + 1][0], p[i + 1][1], w, col, a); }
  // a soft shadow or highlight that fades to nothing at its edge
  soft(cx, cy, rx, ry, col, a) {
    const c = typeof col === 'string' ? hx(col) : col;
    this.paint([cx - rx, cy - ry, cx + rx, cy + ry], (px, py) => ((px - cx) / rx) * ((px - cx) / rx) + ((py - cy) / ry) * ((py - cy) / ry) < 1, (x, y) => { const d = Math.sqrt(((x - cx) / rx) * ((x - cx) / rx) + ((y - cy) / ry) * ((y - cy) / ry)); return [c[0], c[1], c[2], Math.pow(Math.max(0, 1 - d), 1.4)]; }, null === a ? 1 : a);
  }
  toRgb(size) {
    const R = this.R, out = Buffer.alloc(size * size * 3), s = R / size;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const fx = Math.min(R - 1.001, (x + 0.5) * s - 0.5), fy = Math.min(R - 1.001, (y + 0.5) * s - 0.5), x0 = Math.max(0, Math.floor(fx)), y0 = Math.max(0, Math.floor(fy)), tx = fx - x0, ty = fy - y0;
      for (let ch = 0; ch < 3; ch++) {
        const a = this.px[(y0 * R + x0) * 3 + ch], b = this.px[(y0 * R + x0 + 1) * 3 + ch], c2 = this.px[((y0 + 1) * R + x0) * 3 + ch], d = this.px[((y0 + 1) * R + x0 + 1) * 3 + ch];
        out[(y * size + x) * 3 + ch] = clamp(Math.round((a * (1 - tx) + b * tx) * (1 - ty) + (c2 * (1 - tx) + d * tx) * ty), 0, 255);
      }
    }
    return out;
  }
}

const SH = spline([[1, 48], [2.4, 41.5], [8, 37], [17, 35], [31, 35], [40, 37], [45.6, 41.5], [47, 48]], true);
function torso(c, cloth, o) {
  o = o || {}; const base = hx(cloth), pts = o.pts || SH;
  c.poly(pts, (x, y) => mix(lt(base, 0.1), dk(base, 0.62), clamp((x - 10) / 34 + (y - 36) / 30, 0, 1)));
  c.soft(24, 37, 7, 3, [0, 0, 0], 0.22); c.soft(8, 44, 4, 6, [0, 0, 0], 0.12); c.soft(40, 44, 4, 6, [0, 0, 0], 0.14);
  for (const f of [[12, 40, 15, 48], [35, 40, 33, 48], [19, 44, 17, 48]]) c.line(f[0], f[1], f[2], f[3], 0.35, [0, 0, 0], 0.16);
  if (o.pin) pinstripes(c, pts, base);
}

// ---- the pets: a head (ears, face, muzzle, eyes, nose) inside a little space helmet ----
const circ = (cx, cy, r, n) => { n = n || 24; const p = []; for (let i = 0; i <= n; i++) { const a = i * Math.PI * 2 / n; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; };
const mir = (pts) => pts.map((p) => [48 - p[0], p[1]]);
function petHead(c, kind, P) {
  const fur = [hx(P.fur[0]), hx(P.fur[1])], mask = hx(P.mask), mark = hx(P.mark), eye = hx(P.eye);
  const cat = kind === 'siamese' || kind === 'blackcat' || kind === 'tabby', fc = (x, y) => mix(fur[0], fur[1], clamp(0.3 + (x - 24) * 0.028 + (y - 20) * 0.03, 0, 1));
  const darkFur = (fur[0][0] + fur[0][1] + fur[0][2]) < 230;
  // ears: pointed for most, big for corgi and cats, folded for the pug
  const earL = kind === 'pug' ? [[14, 12], [10.4, 22], [12.6, 28.6], [17, 22.6]] : kind === 'corgi' ? [[12.4, 19], [12.6, 3.8], [21.6, 12]] : cat ? [[12.6, 19.6], [13.4, 5.2], [22, 12]] : kind === 'husky' ? [[13.2, 18], [14.6, 6.2], [21.4, 12.4]] : [[13.6, 18], [14.6, 7.4], [21.2, 12.6]];
  const earR = mir(earL), earIn = kind === 'siamese' ? mark : [236, 160, 150];
  for (const [e, s] of [[earL, 1], [earR, -1]]) {
    c.poly(e, (x, y) => mix(fur[0], fur[1], clamp(0.5 + (x - 24) * 0.03, 0, 1)), 1, kind === 'pug');
    if (kind === 'pug') c.poly(e.map((p) => [24 + (p[0] - 24) * 0.92, p[1] + 0.4]), mask, 0.9, true);
    else c.poly(e.map((p) => [24 + (p[0] - 24) * 0.86 + (s > 0 ? 0.9 : -0.9), p[1] + (p[1] < 15 ? 3.4 : 0.6)]), earIn, 0.85, false);
  }
  // head
  const HD = cat ? spline([[24, 10], [31, 11.5], [35.2, 17], [35.6, 22.6], [31.4, 28.8], [24, 31], [16.6, 28.8], [12.4, 22.6], [12.8, 17], [17, 11.5]], true)
    : spline([[24, 9.6], [31, 11], [34.6, 17], [34.2, 23.6], [30.4, 29.6], [24, 31.8], [17.6, 29.6], [13.8, 23.6], [13.4, 17], [17, 11]], true);
  c.poly(HD, fc);
  const inHead = inPoly(HD);
  // patterns
  if (kind === 'husky') {
    c.paint([12, 8, 36, 32], (x, y) => inHead(x, y) && y < 19 + Math.abs(x - 24) * 0.25 - (Math.abs(x - 24) < 2.6 ? 6 : 0) - (Math.abs(x - 24) < 1 ? 3 : 0), mark, 0.95);
    c.poly([[24, 12], [27.6, 22], [30.6, 29], [24, 31.4], [17.4, 29], [20.4, 22]], mask, 1, true);
    c.poly(spline([[15.4, 21], [18.4, 18.6], [21.4, 20.6], [20, 24.4], [16.6, 25.4]], true), mask, 1, false); c.poly(spline([[32.6, 21], [29.6, 18.6], [26.6, 20.6], [28, 24.4], [31.4, 25.4]], true), mask, 1, false);
  } else if (kind === 'corgi') {
    c.poly([[22.2, 10], [25.8, 10], [26.6, 20], [30.4, 28.8], [24, 31.8], [17.6, 28.8], [21.4, 20]], mark, 1, true);
    c.poly(spline([[15, 24], [19, 24.6], [20.4, 29.2], [17.6, 29.4]], true), mask, 1, false); c.poly(spline([[33, 24], [29, 24.6], [27.6, 29.2], [30.4, 29.4]], true), mask, 1, false);
  } else if (kind === 'shiba') {
    c.ell(17, 25, 4.2, 3.4, mask, 0.95); c.ell(31, 25, 4.2, 3.4, mask, 0.95); c.ell(24, 28.6, 5, 3, mask, 0.95);
    c.ell(19.6, 16.4, 1.1, 0.8, mark, 0.95); c.ell(28.4, 16.4, 1.1, 0.8, mark, 0.95);
  } else if (kind === 'akita') {
    c.poly(spline([[16, 19.6], [20.4, 22.4], [24, 24], [27.6, 22.4], [32, 19.6], [31.6, 27.6], [24, 31.6], [16.4, 27.6]], true), mask, 0.97, false);
    c.poly([[23, 10], [25, 10], [25.6, 19], [22.4, 19]], mark, 0.9, true);
  } else if (kind === 'siamese') {
    c.poly(spline([[16.6, 20.6], [20.4, 19.4], [24, 21.6], [27.6, 19.4], [31.4, 20.6], [30.6, 27.6], [24, 31], [17.4, 27.6]], true), mask, 0.62, false);
  } else if (kind === 'blackcat') {
    c.poly(spline([[18, 26], [24, 24.4], [30, 26], [28.6, 30.6], [24, 31.2], [19.4, 30.6]], true), mask, P.mark === P.mask ? 0.95 : 0.6, false);
    if (P.mark === '#f4f2f6') c.poly([[22.8, 12], [25.2, 12], [25.4, 21], [22.6, 21]], mark, 0.95, true);
  } else if (kind === 'tabby') {
    for (const dx of [-3.2, 0, 3.2]) c.line(24 + dx, 10.6, 24 + dx * 0.9, 15.6, 0.9, mark, 0.85);
    for (const [x1, y1, x2, y2] of [[13.8, 20, 17.6, 21], [13.6, 23, 17.2, 23.4], [34.2, 20, 30.4, 21], [34.4, 23, 30.8, 23.4]]) c.line(x1, y1, x2, y2, 0.8, mark, 0.8);
    c.ell(24, 27.6, 4.6, 3.2, mask, 0.9);
  } else if (kind === 'pug') {
    c.ell(24, 25.2, 7, 6, mask, 0.96);
    for (const dy of [0, 1.6]) c.curve([[19.4, 13.6 + dy], [24, 12.6 + dy], [28.6, 13.6 + dy]], 0.36, dk(fur[1], 0.8), 0.55);
  }
  c.soft(24, 31.6, 7, 1.8, [0, 0, 0], 0.2); c.soft(22, 12.5, 6, 2.6, [255, 255, 255], darkFur ? 0.07 : 0.14); c.soft(30.5, 27, 5, 4, [0, 0, 0], 0.1);
  // muzzle
  if (kind !== 'pug' && !cat) { c.ell(24, 26.4, 5.8, 4.4, mask, 0.98); c.soft(23, 24.8, 3, 1.4, [255, 255, 255], 0.14); }
  // eyes
  const ey = cat ? 20.2 : kind === 'pug' ? 19.8 : 19.6, ex = cat ? 7 : kind === 'pug' ? 7.6 : 7.2;
  for (const sx of [-1, 1]) {
    const cx = 24 + sx * ex * 0.62 + (cat ? sx * 0.4 : 0);
    if (cat) {
      c.ell(cx, ey, 2.7, 2.3, eye); c.ell(cx, ey, 0.85, 2.1, '#0c0a10'); c.ell(cx - 0.7, ey - 0.8, 0.55, 0.55, '#ffffff'); c.curve([[cx - 2.9, ey + 0.2], [cx - 1.2, ey - 1.9], [cx + 1.4, ey - 2.1], [cx + 2.9, ey - 0.4]], 0.4, '#15111a', 0.9);
    } else {
      const big = kind === 'pug' ? 2.2 : 1.7;
      if (kind === 'pug' || kind === 'husky') c.ell(cx, ey, big + 0.9, big + 0.6, '#f4f0ea');
      c.ell(cx, ey, big, big, kind === 'husky' ? eye : '#1b1214'); if (kind === 'husky') c.ell(cx, ey, 0.9, 0.9, '#0c0a10');
      c.ell(cx - 0.55, ey - 0.6, 0.55, 0.55, '#ffffff'); c.ell(cx + 0.5, ey + 0.55, 0.28, 0.28, '#ffffff', 0.7);
    }
  }
  // nose, mouth
  if (cat) {
    c.poly([[22.8, 24.2], [25.2, 24.2], [24, 25.6]], kind === 'blackcat' ? [150, 110, 120] : [224, 140, 140], 1, false);
    c.curve([[24, 25.6], [24, 26.8], [22, 27.8]], 0.3, '#2a1a1a', 0.85); c.curve([[24, 26.8], [26, 27.8]], 0.3, '#2a1a1a', 0.85);
    for (const s of [-1, 1]) for (const dy of [-0.4, 0.9]) c.line(24 + s * 6, 25.4 + dy, 24 + s * 11.2, 24.6 + dy * 1.8, 0.2, [255, 255, 255], 0.55);
  } else {
    const ny = kind === 'pug' ? 24.8 : 24.2;
    c.poly(spline([[22.2, ny - 0.9], [25.8, ny - 0.9], [26, ny + 0.4], [24, ny + 1.5], [22, ny + 0.4]], true), '#1a1216', 1, false); c.ell(23.2, ny - 0.4, 0.55, 0.3, '#ffffff', 0.5);
    c.line(24, ny + 1.4, 24, ny + 3.4, 0.35, '#2a1a1a', 0.9); c.curve([[20.6, ny + 3.6], [22.4, ny + 4.6], [24, ny + 3.4], [25.6, ny + 4.6], [27.4, ny + 3.6]], 0.36, '#2a1a1a', 0.9);
    if (kind !== 'pug') c.poly(spline([[22.6, ny + 4.4], [25.4, ny + 4.4], [25, ny + 6.2], [24, ny + 6.6], [23, ny + 6.2]], true), [240, 120, 130], 0.95, false);
  }
}
function accessory(c, acc, col) {
  const cc = typeof col === 'string' ? col : '#ff5d7a', k = hx(cc);
  if (acc === 'bell') { c.ell(21, 37.6, 1.7, 1.7, '#ffd98a'); c.line(21, 36, 21, 37.6, 0.3, '#8a6a20'); c.ell(20.4, 37, 0.5, 0.5, '#ffffff', 0.7); }
  else if (acc === 'bandana') { c.poly([[15, 31.4], [33, 31.4], [24, 40]], k, 0.98, true); c.line(15, 31.4, 33, 31.4, 0.5, dk(k, 0.7)); for (const p of [[21, 33.4], [24, 35.2], [27, 33.4], [24, 32.8]]) c.ell(p[0], p[1], 0.38, 0.38, '#ffffff', 0.8); }
  else if (acc === 'bowtie') { c.poly([[24, 38.8], [19.6, 36.2], [19.6, 41.4]], k, 1, false); c.poly([[24, 38.8], [28.4, 36.2], [28.4, 41.4]], k, 1, false); c.ell(24, 38.8, 1.2, 1.4, dk(k, 0.75)); }
  else if (acc === 'partyhat') { c.poly([[19.6, 11.2], [28.4, 11.2], [24, 0.8]], k, 1, false); for (const p of [[22.6, 8], [25.4, 6.4], [24, 3.8]]) c.ell(p[0], p[1], 0.6, 0.6, '#ffffff', 0.85); c.ell(24, 1, 1.4, 1.4, '#ffffff'); }
  else if (acc === 'flower') { for (let i = 0; i < 5; i++) { const a = i * Math.PI * 2 / 5; c.ell(31.6 + Math.cos(a) * 1.7, 11.8 + Math.sin(a) * 1.7, 1.2, 1.2, k, 0.97); } c.ell(31.6, 11.8, 1, 1, '#ffe27a'); }
  else if (acc === 'sunnies') { for (const cx of [19, 29]) c.poly([[cx - 3.6, 17.6], [cx + 3.6, 17.6], [cx + 3.1, 21.8], [cx, 22.6], [cx - 3.1, 21.8]], (x, y) => mix([14, 14, 24], [64, 66, 92], clamp((y - 17.6) / 5 + (x - cx) * 0.04, 0, 1)), 0.97, true); c.line(22.4, 18.4, 25.6, 18.4, 0.4, '#15151f'); c.soft(18, 18.6, 1.6, 0.7, [255, 255, 255], 0.35); c.soft(28, 18.6, 1.6, 0.7, [255, 255, 255], 0.35); }
}
// a pet sitting for its adoption portrait: chest, front paws, a collar with a heart tag, then the head
function astro(c, L, P, kind, ex) {
  ex = ex || {};
  const fur = [hx(P.fur[0]), hx(P.fur[1])], mask = hx(P.mask), col = hx(L.suit);
  const fc = (x, y) => mix(fur[0], fur[1], clamp(0.35 + (x - 24) * 0.03 + (y - 40) * 0.02, 0, 1));
  c.soft(24, 47, 20, 4, [0, 0, 0], 0.3);
  c.poly(spline([[8, 48], [9.6, 40], [14, 34], [24, 31], [34, 34], [38.4, 40], [40, 48]], true), fc);
  c.ell(24, 42.6, 7.6, 7, mask, 0.9);
  for (const sx of [-1, 1]) { c.ell(24 + sx * 7.6, 47, 4.2, 2.8, fc); c.ell(24 + sx * 7.6, 47, 3, 1.8, mask, 0.9); for (const d of [-1.2, 0, 1.2]) c.line(24 + sx * 7.6 + d, 46.2, 24 + sx * 7.6 + d, 48, 0.2, dk(fur[1], 0.7), 0.6); }
  c.soft(24, 33.6, 8, 1.6, [0, 0, 0], 0.28);
  petHead(c, kind, P);
  // collar and tag
  c.curve([[14.6, 30.8], [24, 34.4], [33.4, 30.8]], 2.3, col, 0.98); c.curve([[14.6, 30.2], [24, 33.8], [33.4, 30.2]], 0.4, [255, 255, 255], 0.3);
  c.ell(24, 36, 2, 2, '#ffd98a'); c.ell(24, 36, 1.5, 1.5, '#f0b84a');
  c.poly([[24, 37.3], [22.7, 35.9], [23.3, 35.1], [24, 35.7], [24.7, 35.1], [25.3, 35.9]], '#c8383f', 1, false);
  if (ex.accessory) ex.accessory(c);
  if (ex.post) ex.post(c);
}
// Titan: the flagship. A big golden Akita in a gold collar and a little crown
function titan(c) {
  const L = { suit: '#e8b82e' };
  const P = { fur: ['#f0c070', '#c8903a'], mask: '#fff6e2', mark: '#ffffff', eye: '#2a1a12' };
  astro(c, L, P, 'akita', { post(c) {
    c.poly([[17.4, 9.6], [18.6, 4.8], [21.2, 7.4], [24, 3.4], [26.8, 7.4], [29.4, 4.8], [30.6, 9.6]], '#e8b82e', 1, false); c.line(17.4, 9.8, 30.6, 9.8, 0.7, '#fff0a8'); c.ell(24, 6.8, 0.8, 0.8, '#c8383f'); c.soft(24, 6, 6, 3.4, [255, 217, 138], 0.32);
    c.ell(24, 36, 2.6, 2.6, '#fff0a8'); c.ell(24, 36, 1.8, 1.8, '#e8b82e'); } });
}

function bgFor(c, bgIdx, seed) {
  const b = hx(BGS[bgIdx]);
  c.rect(0, 0, N, N, (x, y) => mix(lt(b, 0.12), dk(b, 0.72), clamp(y / 48 * 0.9, 0, 1)));
  c.rect(0, 40, N, 8, dk(b, 0.55));
  c.soft(24, 20, 26, 22, [255, 214, 150], 0.14);
  // a window with a warm light, hearts and paw prints on the wall
  c.rect(31, 5, 12, 14, [255, 232, 180], 0.25); c.rect(31.6, 5.6, 10.8, 12.8, [255, 232, 180], 0.18); c.line(37, 5, 37, 19, 0.5, dk(b, 0.5), 0.6); c.line(31, 12, 43, 12, 0.5, dk(b, 0.5), 0.6);
  const pc = [[255, 160, 150], [255, 214, 140], [190, 230, 200], [200, 180, 255]][seed % 4];
  for (let i = 0; i < 5; i++) { const x = 5 + hash(i + 3, seed % 97) * 18, y = 6 + hash(i + 11, seed % 89) * 26, r = 0.9 + hash(i, 4) * 0.7;
    c.ell(x, y + r * 0.5, r, r * 0.8, pc, 0.2); for (const [dx, dy] of [[-1.1, -0.9], [-0.4, -1.5], [0.4, -1.5], [1.1, -0.9]]) c.ell(x + dx * r, y + dy * r, r * 0.34, r * 0.4, pc, 0.2); }
}
function paint(slot, secret, opts) {
  const t = traitsFor(slot, secret), sp = SPECIES[t.species], L = Object.assign({}, sp.looks[t.look]);
  if (opts && /^#[0-9a-f]{6}$/.test(opts.suit || '')) L.suit = opts.suit;
  const c = new Canvas(BGS[t.bg]); bgFor(c, t.bg, t.seed);
  astro(c, L, L, sp.kind, { accessory(c) { accessory(c, t.acc, ACC_COL[t.accColor]); } });
  return c;
}
function paintFlagship() { const c = new Canvas('#070b1f'); bgFor(c, 1, 7); c.soft(24, 20, 26, 26, [255, 214, 90], 0.1); titan(c); return c; }

// ---- flat pictures for logos and tiles, cached because drawing one takes a moment ----
const picCache = new Map();
function cached(key, size, make) {
  size = Math.max(32, Math.min(2048, Math.round(size) || 512));
  const k = key + ':' + size; let b = picCache.get(k);
  if (!b) { b = encodePng(make().toRgb(size), size, size); picCache.set(k, b); if (picCache.size > 160) picCache.delete(picCache.keys().next().value); }
  return b;
}

const png = (slot, secret, size, opts) => cached('a' + secret + ':' + slot + ':' + ((opts && opts.suit) || ''), size || 512, () => paint(slot, secret, opts));
const founderPng = (size) => cached('prime', size || 512, paintFlagship);

// a five-point star, as runs of squares on a 64 x 64 grid, for the locked tiles and the logo
const STAR = (() => { const p = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 11 : 28, a = -Math.PI / 2 + i * Math.PI / 5; p.push([32 + r * Math.cos(a), 34 + r * Math.sin(a)]); } return p; })();
const SHAPE_ON = (x, y) => {
  const px = x + 0.5, py = y + 0.5; let inside = false;
  for (let i = 0, j = STAR.length - 1; i < STAR.length; j = i++) {
    const [xi, yi] = STAR[i], [xj, yj] = STAR[j];
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
function silhouette() {
  const runs = [];
  for (let y = 0; y < 64; y++) { let x = 0; while (x < 64) { if (!SHAPE_ON(x, y)) { x++; continue; } let n = 1; while (x + n < 64 && SHAPE_ON(x + n, y)) n++; runs.push([y, x, n]); x += n; } }
  return runs;
}

module.exports = { png, founderPng, silhouette, traitsFor, agentFor, ROLES, ABILITIES, SPECIES, N };
