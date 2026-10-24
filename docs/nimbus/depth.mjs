/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Petals falling at real depths. Each piece has a distance z from 0 (far) to
// 1 (right in front of you): far ones are small, sharp and slow; close ones
// are big, soft and quick, the closest blurred like a lens focused on the
// scene behind them. The closest pieces are drawn on a layer in front of the
// page (see ambient.mjs), so they drift over the interface.

const XHTML = "http://www.w3.org/1999/xhtml";
const TAU = Math.PI * 2;
const BASE = 96;
// Blur, in sprite pixels, for each depth tier.
const BLURS = [0, 2, 5, 10];
const sprites = new Map();

// A petal drawn once per color and blur, then stamped every frame.
function sprite(doc, color, tier) {
  const key = `${color}|${tier}`;
  let c = sprites.get(key);
  if (c) {
    return c;
  }
  const blur = BLURS[tier];
  const size = BASE + blur * 4 + 4;
  c = doc.createElementNS(XHTML, "canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d");
  ctx.translate(size / 2, size / 2);
  if (blur) {
    ctx.filter = `blur(${blur}px)`;
  }
  const s = BASE * 0.44;
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.quadraticCurveTo(-s * 0.2, -s * 0.9, s, -s * 0.2);
  ctx.lineTo(s * 0.7, 0);
  ctx.lineTo(s, s * 0.2);
  ctx.quadraticCurveTo(-s * 0.2, s * 0.9, -s, 0);
  ctx.fillStyle = color;
  ctx.fill();
  sprites.set(key, c);
  return c;
}

const lerp = (a, b, t) => a + (b - a) * t;

// An effect for ambient.mjs. Pieces with z above FRONT go to the front layer.
export const FRONT = 0.82;

export function depthFall({ colors, count = 60, fall = [14, 70], wind = -18, sway = 22 }) {
  return {
    count,
    depth: true,
    spawn(r, W, H, first) {
      // Most pieces are far away; a few come very close.
      const z = Math.min(1, Math.pow(r(), 1.7) * 1.05);
      const tier = z < 0.55 ? 0 : z < FRONT ? 1 : z < 0.94 ? 2 : 3;
      const size = tier === 3 ? lerp(90, 150, r()) : lerp(9, 54, z / 0.94);
      return {
        color: colors[Math.floor(r() * colors.length)],
        z,
        tier,
        size,
        x: first ? r() * W : lerp(-0.1, 1.15, r()) * W,
        y: first ? r() * H : -size,
        vy: lerp(fall[0], fall[1], z),
        vx: wind * lerp(0.4, 2.2, z),
        sway: sway * lerp(0.4, 1.6, z),
        swayF: 0.6 + r() * 1.2,
        ph: r() * TAU,
        rot: r() * TAU,
        spin: (r() - 0.5) * 2.4,
        flip: 1 + r() * 2.5,
        a: tier === 3 ? 0.82 : lerp(0.55, 0.95, z),
      };
    },
    step(p, dt, t, W, H) {
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(t * p.swayF + p.ph) * p.sway) * dt;
      p.rot += p.spin * dt;
      return p.y < H + p.size && p.x > -p.size * 2 && p.x < W + p.size * 2;
    },
    draw(ctx, p, t) {
      const img = sprite(ctx.canvas.ownerDocument, p.color, p.tier);
      const scale = p.size / BASE;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      // Petals turn over as they fall, showing their edge now and then.
      ctx.scale(0.25 + 0.75 * Math.abs(Math.cos(t * p.flip + p.ph)), 1);
      ctx.globalAlpha = p.a;
      ctx.drawImage(img, (-img.width * scale) / 2, (-img.height * scale) / 2, img.width * scale, img.height * scale);
      ctx.restore();
    },
  };
}
