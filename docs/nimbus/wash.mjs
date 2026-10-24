/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Paints a scene as watercolor on paper: a few translucent washes rising from
// one corner, each with soft bleeding edges, pigment pooled along its wet edge,
// uneven density and speckled granulation, over grained paper.

const XHTML = "http://www.w3.org/1999/xhtml";
const cache = new Map();

export function paintScene(doc, id, scene, seed = scene.seed, width = 1920, height = 1200) {
  const key = `${id}:${seed}:${width}x${height}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      paint(doc, scene, width, height, seed).catch((e) => {
        cache.delete(key);
        throw e;
      })
    );
  }
  return cache.get(key);
}

function canvas(doc, w, h) {
  const c = doc.createElementNS(XHTML, "canvas");
  c.width = w;
  c.height = h;
  return c;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth noise along a line, from -0.5 to 0.5.
function noiseLine(rand, octaves) {
  const tables = [];
  for (let o = 0; o < octaves; o++) {
    tables.push(Array.from({ length: (3 << o) + 2 }, rand));
  }
  return (x) => {
    const p = Math.min(0.9999, Math.max(0, x));
    let sum = 0;
    let amp = 1;
    let norm = 0;
    tables.forEach((t, o) => {
      const f = p * (3 << o);
      const i = Math.floor(f);
      const r = f - i;
      const s = r * r * (3 - 2 * r);
      sum += amp * (t[i] * (1 - s) + t[i + 1] * s);
      norm += amp;
      amp *= 0.5;
    });
    return sum / norm - 0.5;
  };
}

function rgba(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${Math.max(0, Math.min(1, a)).toFixed(3)})`;
}

// Random flecks where pigment settles less, tiled over each wash.
function specks(doc, rand, dark) {
  const size = 384;
  const c = canvas(doc, size, size);
  const ctx = c.getContext("2d");
  for (let i = 0; i < 4200; i++) {
    const r = rand() < 0.9 ? 0.35 + rand() * 0.6 : 0.9 + rand() * 0.8;
    ctx.fillStyle = `rgba(0, 0, 0, ${(dark ? 0.08 : 0.11) * rand()})`;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * size, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return c;
}

// How each wash sits on the paper, by the scene's composition. Values are
// fractions of the height: where the wash's edge starts, how much it climbs
// across the width, how ragged it is, and how much it swells.
function shapeOf(form, k, t, rand, flip) {
  const j = () => rand() - 0.5;
  switch (form) {
    // Washes from both lower corners, meeting in a valley.
    case "valley":
      return { startY: 0.9 + t * 0.32 + j() * 0.05, rise: 0.62 - t * 0.12 + j() * 0.08, rough: 0.08 - t * 0.03, mirror: (k % 2 === 1) !== flip, fromTop: false, wave: 0 };
    // Bands across the lower half, under a wash of sky.
    case "horizon":
      if (k === 0) {
        return { startY: 0.16 + j() * 0.06, rise: j() * 0.1, rough: 0.05, mirror: flip, fromTop: true, wave: 0.02 };
      }
      return { startY: 0.5 + t * 0.36 + j() * 0.04, rise: j() * 0.14, rough: 0.045 - t * 0.015, mirror: rand() < 0.5, fromTop: false, wave: 0.015 };
    // Long, soft swells.
    case "dunes":
      return { startY: 0.95 + t * 0.3 + j() * 0.04, rise: 0.55 - t * 0.08 + j() * 0.06, rough: 0.025, mirror: flip, fromTop: false, wave: 0.05 + rand() * 0.03 };
    // Streaks falling from the top, like light moving across a night sky.
    case "sky":
      return { startY: 0.06 + t * 0.32 + j() * 0.06, rise: -(0.25 + rand() * 0.25), rough: 0.1 - t * 0.03, mirror: rand() < 0.5 !== flip, fromTop: true, wave: 0.03 };
    // Up from one corner toward the other.
    default:
      return { startY: 0.98 + t * 0.34 + j() * 0.04, rise: 0.86 - t * 0.1 + j() * 0.06, rough: 0.09 - t * 0.03, mirror: flip, fromTop: false, wave: 0 };
  }
}

async function paint(doc, scene, W, H, seed) {
  const out = canvas(doc, W, H);
  const ctx = out.getContext("2d");
  const rand = rng(seed);
  const dark = scene.tone === "dark";
  // A shuffled painting may also turn to face the other way.
  const flip = !!scene.mirror !== (seed !== scene.seed && rand() < 0.5);

  ctx.fillStyle = scene.paper;
  ctx.fillRect(0, 0, W, H);
  // Paper is never perfectly even.
  for (let i = 0; i < 7; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = (0.25 + rand() * 0.35) * W;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const tone = rand() < 0.5 ? "0, 0, 0" : "255, 255, 255";
    g.addColorStop(0, `rgba(${tone}, ${dark ? 0.05 : 0.025})`);
    g.addColorStop(1, `rgba(${tone}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  const speck = specks(doc, rand, dark);
  const n = scene.washes.length;
  scene.washes.forEach((wash, k) => {
    const t = n === 1 ? 1 : k / (n - 1); // 0 is the farthest wash
    const layer = canvas(doc, W, H);
    const l = layer.getContext("2d");
    const noise = noiseLine(rand, 5);
    // The edge of the wash, as a fraction of the height along the width.
    const { startY, rise, rough, mirror, fromTop, wave } = shapeOf(scene.form, k, t, rand, flip);
    const freq = 1.1 + rand() * 0.8;
    const phase = rand() * Math.PI * 2;
    const xOf = (u) => (mirror ? 1 - u : u) * W;
    const edge = [];
    for (let i = 0; i <= 180; i++) {
      const u = -0.06 + (1.12 * i) / 180;
      const y = startY - rise * u + rough * 2 * noise((u + 0.06) / 1.12) + wave * Math.sin(u * Math.PI * 2 * freq + phase);
      edge.push([xOf(u), y * H]);
    }
    // The paint lies below its edge, or above it for washes from the top.
    const outside = fromTop ? -80 : H + 80;
    const body = new Path2D();
    body.moveTo(edge[0][0], outside);
    for (const [x, y] of edge) {
      body.lineTo(x, y);
    }
    body.lineTo(edge[edge.length - 1][0], outside);
    body.closePath();
    const line = new Path2D();
    edge.forEach(([x, y], i) => (i ? line.lineTo(x, y) : line.moveTo(x, y)));

    // Pigment pools at the wet edge, thins out, then deepens toward the
    // bottom. The gradient runs across the edge, so it follows the diagonal.
    const mid = edge[90];
    const dx = edge[180][0] - edge[0][0];
    const dy = edge[180][1] - edge[0][1];
    const len = Math.hypot(dx, dy);
    let nx = -dy / len;
    let ny = dx / len;
    if (ny < 0 !== fromTop) {
      nx = -nx;
      ny = -ny;
    }
    const reach = Math.hypot(W, H);
    const g = l.createLinearGradient(mid[0], mid[1], mid[0] + nx * reach, mid[1] + ny * reach);
    g.addColorStop(0, rgba(wash.c, wash.a));
    g.addColorStop(0.035, rgba(wash.c, wash.a * 0.66));
    g.addColorStop(0.3, rgba(wash.c, wash.a * 0.52));
    g.addColorStop(0.75, rgba(wash.c, wash.a * 0.78));
    g.addColorStop(1, rgba(wash.c, wash.a * 0.92));

    // A faint bloom where the wet paint crept past its edge, then the wash.
    l.filter = `blur(${22 + 10 * (1 - t)}px)`;
    l.globalAlpha = 0.3;
    l.fillStyle = g;
    l.fill(body);
    l.globalAlpha = 1;
    l.filter = `blur(${1.6 + 2.4 * (1 - t)}px)`;
    l.fill(body);

    // Uneven density: lighter patches where the water pushed pigment away.
    l.filter = "none";
    l.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 9; i++) {
      const p = edge[Math.floor(rand() * edge.length)];
      const x = p[0] + nx * rand() * H * 0.5;
      const y = p[1] + ny * rand() * H * 0.5;
      const r = (0.06 + rand() * 0.16) * W;
      const lift = l.createRadialGradient(x, y, 0, x, y, r);
      lift.addColorStop(0, `rgba(0, 0, 0, ${0.12 + rand() * 0.2})`);
      lift.addColorStop(1, "rgba(0, 0, 0, 0)");
      l.fillStyle = lift;
      l.fillRect(0, 0, W, H);
    }
    l.fillStyle = l.createPattern(speck, "repeat");
    l.fillRect(0, 0, W, H);
    l.globalCompositeOperation = "source-over";

    // The dried edge: a thin, darker line of pigment.
    l.filter = "blur(1.1px)";
    l.strokeStyle = rgba(wash.c, Math.min(1, wash.a * (dark ? 0.9 : 1.15)));
    l.lineWidth = 1.6 + t;
    l.stroke(line);
    l.filter = "none";

    // Light washes darken what they cover, like real glazes; dark scenes lay
    // lighter paint over dark paper instead.
    ctx.globalCompositeOperation = scene.blend || (dark ? "source-over" : "multiply");
    ctx.drawImage(layer, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  });

  // Grain over everything, so the paper shows through the paint.
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  const amp = (dark ? 6 : 9) * (scene.grain ?? 1);
  let s = (seed * 7919) | 0;
  for (let i = 0; i < d.length; i += 4) {
    s = (Math.imul(s, 1103515245) + 12345) | 0;
    const v = (((s >>> 16) & 255) / 255 - 0.5) * amp;
    d[i] += v;
    d[i + 1] += v;
    d[i + 2] += v;
  }
  ctx.putImageData(img, 0, 0);

  const blob = await new Promise((resolve) => out.toBlob(resolve, "image/jpeg", 0.92));
  return URL.createObjectURL(blob);
}
