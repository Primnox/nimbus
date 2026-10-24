/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// The living part of a theme: pollen, fog, petals, stars, sparks and the like,
// drawn over the painting. It runs while the painting is in view (a new tab)
// and the window is in front, at a gentle frame rate, and rests otherwise.

import { depthFall, FRONT } from "./depth.mjs";

const XHTML = "http://www.w3.org/1999/xhtml";
const FPS = 30;

function hexRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
const rgba = (rgb, a) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Math.max(0, Math.min(1, a)).toFixed(3)})`;

function glowDot(ctx, x, y, r, rgb, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
  g.addColorStop(0, rgba(rgb, a));
  g.addColorStop(0.35, rgba(rgb, a * 0.45));
  g.addColorStop(1, rgba(rgb, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 3, 0, Math.PI * 2);
  ctx.fill();
}

// Each effect: how many particles, how one is born, how it moves (returning
// false when it should be reborn), how it's drawn, and an optional backdrop
// drawn under the particles every frame.
const EFFECTS = {
  pollen: {
    count: 44,
    spawn: (r, W, H, first) => ({ x: r() * W, y: first ? r() * H : H + 12, s: 0.8 + r() * 2, vy: -(5 + r() * 9), sway: r() * 6.3, a: 0.25 + r() * 0.4, tint: r() < 0.3 }),
    step: (p, dt, t) => {
      p.y += p.vy * dt;
      p.x += Math.sin(t * 0.5 + p.sway) * 9 * dt;
      return p.y > -12;
    },
    draw: (ctx, p, t, c) => glowDot(ctx, p.x, p.y, p.s, p.tint ? c.accent : c.light, p.a),
  },

  fog: {
    count: 7,
    spawn: (r, W, H) => ({ x: r() * W * 1.4 - W * 0.2, y: H * (0.15 + r() * 0.8), rx: W * (0.22 + r() * 0.2), ry: H * (0.08 + r() * 0.08), vx: (r() < 0.5 ? -1 : 1) * (5 + r() * 9), a: 0.1 + r() * 0.1 }),
    step: (p, dt, t, W) => {
      p.x += p.vx * dt;
      if (p.x - p.rx > W) {
        p.x = -p.rx;
      } else if (p.x + p.rx < 0) {
        p.x = W + p.rx;
      }
      return true;
    },
    draw: (ctx, p, t, c) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(1, p.ry / p.rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.rx);
      g.addColorStop(0, rgba(c.light, p.a * (0.85 + 0.15 * Math.sin(t * 0.3 + p.x))));
      g.addColorStop(1, rgba(c.light, 0));
      ctx.fillStyle = g;
      ctx.fillRect(-p.rx, -p.rx, p.rx * 2, p.rx * 2);
      ctx.restore();
    },
  },

  grains: {
    count: 70,
    spawn: (r, W, H, first) => ({ x: first ? r() * W : W + r() * 60, y: H * (0.25 + r() * 0.75), v: 50 + r() * 110, len: 4 + r() * 10, a: 0.18 + r() * 0.3, fall: 2 + r() * 6 }),
    step: (p, dt, t) => {
      const gust = 0.7 + 0.5 * Math.max(0, Math.sin(t * 0.35));
      p.x -= p.v * gust * dt;
      p.y += p.fall * dt;
      return p.x > -20;
    },
    draw: (ctx, p, t, c) => {
      ctx.strokeStyle = rgba(c.accent, p.a);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.len, p.y - p.len * 0.08);
      ctx.stroke();
    },
  },

  stars: {
    count: 110,
    spawn: (r, W, H) => ({ x: r() * W, y: r() * H * 0.7, s: 0.5 + r() * 1.1, a: 0.3 + r() * 0.6, f: 0.6 + r() * 2.2, ph: r() * 6.3 }),
    step: () => true,
    draw: (ctx, p, t, c) => {
      ctx.fillStyle = rgba(c.light, p.a * (0.55 + 0.45 * Math.sin(t * p.f + p.ph)));
      ctx.fillRect(p.x, p.y, p.s, p.s);
    },
    backdrop: (ctx, t, W, H, c, state) => {
      // Now and then a star falls.
      if (!state.shot || t - state.shot.t0 > 1.4) {
        if (!state.next) {
          state.next = t + 6 + Math.random() * 8;
        }
        if (t >= state.next) {
          state.shot = { t0: t, x: W * (0.2 + Math.random() * 0.7), y: H * (0.05 + Math.random() * 0.25) };
          state.next = 0;
        }
      }
      if (state.shot && t - state.shot.t0 <= 1.4) {
        const k = (t - state.shot.t0) / 1.4;
        const x = state.shot.x - k * 260;
        const y = state.shot.y + k * 110;
        const g = ctx.createLinearGradient(x, y, x + 90, y - 38);
        g.addColorStop(0, rgba(c.light, 0.8 * (1 - k)));
        g.addColorStop(1, rgba(c.light, 0));
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 90, y - 38);
        ctx.stroke();
      }
    },
  },

  fireflies: {
    count: 26,
    spawn: (r, W, H) => ({ x: r() * W, y: H * (0.3 + r() * 0.7), dir: r() * 6.3, v: 8 + r() * 14, f: 0.8 + r() * 1.6, ph: r() * 6.3, s: 1.2 + r() * 1.2 }),
    step: (p, dt, t, W, H) => {
      p.dir += (Math.sin(t * 0.7 + p.ph) * 0.9) * dt;
      p.x += Math.cos(p.dir) * p.v * dt;
      p.y += Math.sin(p.dir) * p.v * dt;
      if (p.x < -20 || p.x > W + 20 || p.y < H * 0.15 || p.y > H + 20) {
        p.dir += Math.PI;
      }
      return true;
    },
    draw: (ctx, p, t, c) => glowDot(ctx, p.x, p.y, p.s, c.accent, 0.15 + 0.75 * Math.max(0, Math.sin(t * p.f + p.ph))),
  },

  rays: {
    count: 18,
    spawn: (r, W, H, first) => ({ x: r() * W, y: first ? r() * H : H + 8, vy: -(3 + r() * 5), s: 0.6 + r() * 1.2, a: 0.2 + r() * 0.35, sway: r() * 6.3 }),
    step: (p, dt, t) => {
      p.y += p.vy * dt;
      p.x += Math.sin(t * 0.4 + p.sway) * 5 * dt;
      return p.y > -8;
    },
    draw: (ctx, p, t, c) => glowDot(ctx, p.x, p.y, p.s, c.light, p.a),
    backdrop: (ctx, t, W, H, c) => {
      // Soft beams of morning light from the upper left, swaying slowly.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 4; i++) {
        const a = -0.55 + i * 0.16 + Math.sin(t * 0.12 + i * 1.7) * 0.05;
        const w = 0.05 + (i % 2) * 0.03;
        const len = Math.hypot(W, H) * 1.2;
        const ox = -W * 0.05;
        const oy = -H * 0.1;
        const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(-a) * len * 0.7, oy + Math.sin(-a) * len * 0.7);
        g.addColorStop(0, rgba(c.light, 0.16));
        g.addColorStop(1, rgba(c.light, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + Math.cos(-a - w) * len, oy + Math.sin(-a - w) * len);
        ctx.lineTo(ox + Math.cos(-a + w) * len, oy + Math.sin(-a + w) * len);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    },
  },

  ripples: {
    count: 7,
    spawn: (r, W, H, first) => ({ x: r() * W, y: H * (0.45 + r() * 0.5), age: first ? r() * 4 : 0, life: 3.5 + r() * 2, max: 50 + r() * 70 }),
    step: (p, dt) => {
      p.age += dt;
      return p.age < p.life;
    },
    draw: (ctx, p, t, c) => {
      const k = p.age / p.life;
      for (const off of [0, 0.22]) {
        const kk = k - off;
        if (kk <= 0) {
          continue;
        }
        ctx.strokeStyle = rgba(c.light, 0.45 * (1 - kk) * (1 - kk));
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.max * kk, p.max * kk * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },

  bubbles: {
    count: 22,
    spawn: (r, W, H, first) => ({ x: r() * W, y: first ? r() * H : H + 14, vy: -(12 + r() * 20), sway: r() * 6.3, s: 3 + r() * 8, a: 0.35 + r() * 0.35 }),
    step: (p, dt, t) => {
      p.y += p.vy * dt;
      p.x += Math.sin(t * 1.1 + p.sway) * 10 * dt;
      return p.y > -16;
    },
    draw: (ctx, p, t, c) => {
      ctx.strokeStyle = rgba(c.light, p.a);
      ctx.fillStyle = rgba(c.wash, p.a * 0.25);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = rgba(c.light, p.a * 0.9);
      ctx.beginPath();
      ctx.arc(p.x - p.s * 0.35, p.y - p.s * 0.35, p.s * 0.22, 0, Math.PI * 2);
      ctx.fill();
    },
  },

  embers: {
    count: 54,
    additive: true,
    spawn: (r, W, H, first) => ({ x: W * (0.15 + r() * 0.85), y: first ? r() * H : H + 8, vy: -(18 + r() * 42), drift: (r() - 0.3) * 14, s: 0.8 + r() * 1.6, f: 4 + r() * 8, ph: r() * 6.3, life: 0 }),
    step: (p, dt) => {
      p.y += p.vy * dt;
      p.x += p.drift * dt;
      p.life += dt;
      return p.y > -10;
    },
    draw: (ctx, p, t, c) => glowDot(ctx, p.x, p.y, p.s, c.accent, (0.45 + 0.4 * Math.sin(t * p.f + p.ph)) * Math.min(1, p.life * 2)),
  },

  aurora: {
    count: 40,
    additive: true,
    spawn: (r, W, H) => ({ x: r() * W, y: r() * H * 0.55, s: 0.5 + r() * 0.9, a: 0.25 + r() * 0.5, f: 0.5 + r() * 1.5, ph: r() * 6.3 }),
    step: () => true,
    draw: (ctx, p, t, c) => {
      ctx.fillStyle = rgba(c.light, p.a * (0.6 + 0.4 * Math.sin(t * p.f + p.ph)));
      ctx.fillRect(p.x, p.y, p.s, p.s);
    },
    backdrop: (ctx, t, W, H, c, state) => {
      // Curtains of light: columns whose top edge waves along the sky. Each
      // curtain's glow is drawn once into a strip and stamped per column.
      const bands = [
        { base: 0.16, amp: 0.05, k: 2.2, w: 0.22, rgb: c.accent, a: 0.2 },
        { base: 0.26, amp: 0.07, k: 1.4, w: -0.15, rgb: c.wash, a: 0.16 },
        { base: 0.1, amp: 0.04, k: 3.1, w: 0.3, rgb: c.accent2, a: 0.12 },
      ];
      if (!state.strips) {
        state.strips = bands.map((b) => {
          const strip = ctx.canvas.ownerDocument.createElementNS(XHTML, "canvas");
          strip.width = 1;
          strip.height = 128;
          const sc = strip.getContext("2d");
          const g = sc.createLinearGradient(0, 0, 0, 128);
          g.addColorStop(0, rgba(b.rgb, 0));
          g.addColorStop(0.15, rgba(b.rgb, 1));
          g.addColorStop(1, rgba(b.rgb, 0));
          sc.fillStyle = g;
          sc.fillRect(0, 0, 1, 128);
          return strip;
        });
      }
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const step = 14;
      bands.forEach((b, i) => {
        const strip = state.strips[i];
        for (let x = 0; x < W; x += step) {
          const u = x / W;
          const y = H * (b.base + b.amp * Math.sin(u * Math.PI * b.k + t * b.w) + 0.02 * Math.sin(u * 23 + t * 0.9));
          const len = H * (0.18 + 0.08 * Math.sin(u * 7 + t * 0.4));
          ctx.globalAlpha = b.a * (0.5 + 0.5 * Math.sin(u * 5 - t * 0.35));
          ctx.drawImage(strip, x, y, step + 1, len);
        }
      });
      ctx.restore();
    },
  },

};

// Petals with depth: the closest drift in front of the page.
EFFECTS.petals = depthFall({
  colors: ["#e2b9bf", "#efd6d7", "#cd9aa5", "#f3dcdc"],
  count: 46,
  fall: [12, 50],
  wind: -12,
});

export const AMBIENTS = Object.keys(EFFECTS);

export class Ambient {
  constructor(doc) {
    this.doc = doc;
    this.win = doc.defaultView;
    this.canvas = doc.createElementNS(XHTML, "canvas");
    this.canvas.className = "atmo-ambient";
    this.ctx = this.canvas.getContext("2d");
    // The front layer: pieces close to you drift over the page itself.
    this.front = doc.createElementNS(XHTML, "canvas");
    this.front.id = "nimbus-front";
    this.front.hidden = true;
    this.frontCtx = this.front.getContext("2d");
    // Parallax: where the pointer is, from -1 to 1 each way, eased.
    this.look = [0, 0];
    this.off = [0, 0];
    this.onShift = null;
    this.effect = null;
    this.colors = null;
    this.particles = [];
    this.state = {};
    this.wanted = false;
    this.raf = 0;
    this.last = 0;
    this.time = 0;
    this.rand = Math.random;
    this.frame = (now) => this.tick(now);
    this.win.addEventListener("resize", () => this.resize());
  }

  // The effect, and colors from the scene: its accent, its lightest and a
  // middle wash, and a light tone that reads on its paper.
  set(name, scene) {
    const effect = EFFECTS[name] || null;
    const dark = scene.tone === "dark";
    this.colors = {
      accent: hexRgb(scene.accent),
      accent2: hexRgb(scene.washes[scene.washes.length - 1].c),
      wash: hexRgb(scene.washes[1].c),
      particle: hexRgb(scene.particle || scene.washes[1].c),
      light: dark ? [235, 240, 255] : [255, 255, 250],
    };
    if (effect !== this.effect) {
      this.effect = effect;
      this.state = {};
      this.resize();
      this.populate();
    }
    this.canvas.hidden = !effect;
    this.update();
  }

  resize() {
    const W = this.win.innerWidth;
    const H = this.win.innerHeight;
    if (this.canvas.width !== W || this.canvas.height !== H) {
      this.canvas.width = W;
      this.canvas.height = H;
      this.front.width = W;
      this.front.height = H;
      this.populate();
    }
  }

  populate() {
    const e = this.effect;
    const W = this.canvas.width;
    const H = this.canvas.height;
    this.particles = e ? Array.from({ length: e.count }, () => ({ ...e.spawn(this.rand, W, H, true), H })) : [];
  }

  // Runs only when asked to and something is set.
  run(on) {
    this.wanted = !!on;
    this.update();
  }

  update() {
    const go = this.wanted && !!this.effect;
    if (go && !this.raf) {
      this.last = 0;
      this.raf = this.win.requestAnimationFrame(this.frame);
    } else if (!go && this.raf) {
      this.win.cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
  }

  tick(now) {
    this.raf = this.win.requestAnimationFrame(this.frame);
    const fps = (this.effect && this.effect.fps) || FPS;
    if (this.last && now - this.last < 1000 / fps - 2) {
      return;
    }
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 1 / FPS;
    this.last = now;
    this.time += dt;
    // Ease toward where the pointer is.
    const k = 1 - Math.pow(0.02, dt);
    this.off[0] += (this.look[0] - this.off[0]) * k;
    this.off[1] += (this.look[1] - this.off[1]) * k;
    if (this.onShift) {
      this.onShift(this.off);
    }
    this.draw(dt);
  }

  // Where the pointer is, from -1 to 1 across the window each way.
  lookAt(x, y) {
    this.look[0] = Math.max(-1, Math.min(1, x));
    this.look[1] = Math.max(-1, Math.min(1, y));
  }

  showFront(on) {
    this.front.hidden = !on || !this.effect || !this.effect.depth;
    if (this.front.hidden) {
      this.frontCtx.clearRect(0, 0, this.front.width, this.front.height);
    }
  }

  draw(dt) {
    const e = this.effect;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);
    if (!e) {
      return;
    }
    if (e.backdrop) {
      e.backdrop(ctx, this.time, W, H, this.colors, this.state);
    }
    const front = this.frontCtx;
    if (e.depth) {
      front.clearRect(0, 0, W, H);
    }
    ctx.save();
    if (e.additive) {
      ctx.globalCompositeOperation = "lighter";
    }
    // Nearer pieces shift further with the pointer, which is what gives depth.
    const [ox, oy] = this.off;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!e.step(p, dt, this.time, W, H)) {
        this.particles[i] = { ...e.spawn(this.rand, W, H, false), H };
        continue;
      }
      const z = p.z ?? 0.5;
      const target = e.depth && z >= FRONT && !this.front.hidden ? front : ctx;
      target.save();
      target.translate(-ox * z * 46, -oy * z * 28);
      e.draw(target, p, this.time, this.colors);
      target.restore();
    }
    ctx.restore();
  }

  // One still frame, for when motion is off but the layer should show.
  still() {
    this.draw(0);
  }
}
