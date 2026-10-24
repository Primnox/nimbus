// Themes. Each one is a whole personality, not just a picture:
//   ambient  what moves over it (see ambient.mjs)
//   feel     how the interface moves: easing, speed, entrances and hovers
//   shape    corners, outlines and shadows
//   type     the lettering
// Watercolor washes run from the farthest to the nearest.
export const SCENES = {
  meadow: {
    name: 'Sage',
    mood: 'Calm and slow. Pollen drifts upward.',
    tone: 'light',
    paper: '#f2ede3',
    washes: [
      { c: '#cbd5bd', a: 0.55 },
      { c: '#a9bb98', a: 0.6 },
      { c: '#86a078', a: 0.62 },
      { c: '#5f7d58', a: 0.55 },
    ],
    accent: '#5b7a52',
    seed: 7,
    ambient: 'pollen',
    feel: 'calm',
    shape: 'default',
  },
  tide: {
    name: 'Mist',
    mood: 'Unhurried. Fog rolls across the hills.',
    tone: 'light',
    paper: '#eff1ef',
    washes: [
      { c: '#cad8de', a: 0.55 },
      { c: '#a3bcc7', a: 0.6 },
      { c: '#7e9fae', a: 0.6 },
      { c: '#56798a', a: 0.52 },
    ],
    accent: '#3c7085',
    seed: 33,
    mirror: true,
    ambient: 'fog',
    feel: 'calm',
    shape: 'default',
  },
  dune: {
    name: 'Sand',
    mood: 'Crisp corners, things slide in. Sand blows past.',
    tone: 'light',
    paper: '#f5eee3',
    washes: [
      { c: '#ecd7bd', a: 0.6 },
      { c: '#ddba96', a: 0.6 },
      { c: '#c99a74', a: 0.58 },
      { c: '#a7785a', a: 0.5 },
    ],
    accent: '#a0623f',
    seed: 21,
    ambient: 'grains',
    feel: 'drift',
    shape: 'crisp',
  },
  bloom: {
    name: 'Blush',
    mood: 'Soft and springy. Petals fall.',
    tone: 'light',
    paper: '#f6efec',
    washes: [
      { c: '#efd6d7', a: 0.6 },
      { c: '#e2b9bf', a: 0.6 },
      { c: '#cd9aa5', a: 0.56 },
      { c: '#ab7686', a: 0.48 },
    ],
    accent: '#a2566c',
    seed: 45,
    mirror: true,
    ambient: 'petals',
    feel: 'breeze',
    shape: 'soft',
  },
  dusk: {
    name: 'Night',
    mood: 'Things glow and blur in. Stars, and the odd shooting star.',
    tone: 'dark',
    paper: '#1c1a24',
    washes: [
      { c: '#2c2740', a: 0.8 },
      { c: '#3a3154', a: 0.75 },
      { c: '#4a3e68', a: 0.7 },
      { c: '#5c4d7e', a: 0.6 },
    ],
    accent: '#c9adff',
    seed: 58,
    ambient: 'stars',
    feel: 'night',
    shape: 'default',
  },
  pine: {
    name: 'Forest',
    mood: 'Smooth and fluid. Fireflies wander.',
    tone: 'dark',
    paper: '#151b18',
    washes: [
      { c: '#203029', a: 0.8 },
      { c: '#2b4136', a: 0.75 },
      { c: '#385444', a: 0.68 },
      { c: '#466853', a: 0.58 },
    ],
    accent: '#9fd8b5',
    seed: 71,
    mirror: true,
    ambient: 'fireflies',
    feel: 'flow',
    shape: 'default',
  },
  dawn: {
    name: 'Dawn',
    mood: 'Gentle, with serif headings. Morning light sways.',
    tone: 'light',
    form: 'horizon',
    paper: '#f8f0e9',
    washes: [
      { c: '#f2cdb8', a: 0.55 },
      { c: '#ecc3b5', a: 0.5 },
      { c: '#d4aac2', a: 0.52 },
      { c: '#a48fb8', a: 0.48 },
    ],
    accent: '#8a5a7a',
    seed: 83,
    ambient: 'rays',
    feel: 'breeze',
    shape: 'soft',
    type: 'serif',
  },
  lagoon: {
    name: 'Lagoon',
    mood: 'Round and fluid. Ripples spread on the water.',
    tone: 'light',
    form: 'valley',
    paper: '#eef4f2',
    washes: [
      { c: '#cde4df', a: 0.58 },
      { c: '#a3cfc7', a: 0.6 },
      { c: '#72afa8', a: 0.58 },
      { c: '#3f8783', a: 0.5 },
    ],
    accent: '#2f7a76',
    seed: 97,
    ambient: 'ripples',
    feel: 'flow',
    shape: 'soft',
  },
  lavender: {
    name: 'Lavender',
    mood: 'Light and floaty. Bubbles rise.',
    tone: 'light',
    form: 'dunes',
    paper: '#f5f2f7',
    washes: [
      { c: '#e3daed', a: 0.6 },
      { c: '#cbbce1', a: 0.6 },
      { c: '#ab98cc', a: 0.55 },
      { c: '#8a74b0', a: 0.48 },
    ],
    accent: '#6f5a9c',
    seed: 109,
    mirror: true,
    ambient: 'bubbles',
    feel: 'airy',
    shape: 'soft',
  },
  ember: {
    name: 'Ember',
    mood: 'Quick and sharp, with warm glows. Sparks rise.',
    tone: 'dark',
    form: 'dunes',
    paper: '#1c1614',
    washes: [
      { c: '#3a241c', a: 0.85 },
      { c: '#5a3324', a: 0.78 },
      { c: '#7d452b', a: 0.68 },
      { c: '#a65d33', a: 0.55 },
    ],
    accent: '#f0a46b',
    seed: 127,
    ambient: 'embers',
    feel: 'spark',
    shape: 'crisp',
  },
  aurora: {
    name: 'Aurora',
    mood: 'Glowing. Curtains of light move across the sky.',
    tone: 'dark',
    form: 'sky',
    blend: 'screen',
    paper: '#0e1320',
    washes: [
      { c: '#2a2552', a: 0.7 },
      { c: '#1b4a4b', a: 0.75 },
      { c: '#1f6a55', a: 0.7 },
      { c: '#3d8f6b', a: 0.55 },
    ],
    accent: '#8fe3c0',
    seed: 139,
    ambient: 'aurora',
    feel: 'night',
    shape: 'default',
  },
};

export const DEFAULT_SCENE = 'meadow';

// Text that reads on an accent: white on most, dark on the light accents of
// the night paintings.
export function inkOn(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v) => (v / 255 <= 0.04045 ? v / 255 / 12.92 : Math.pow((v / 255 + 0.055) / 1.055, 2.4));
  const lum = 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return lum > 0.3 ? "#1d1a24" : "#ffffff";
}

// Days since 1970 in local time, for choices that change once a day.
export function dayNumber(date = new Date()) {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / 86400000);
}

// "auto" follows the time of day; "surprise" picks a different theme each day.
export function effectiveScene(id, date = new Date()) {
  if (id === 'surprise') {
    const ids = Object.keys(SCENES);
    return ids[(Math.imul(dayNumber(date), 2654435761) >>> 0) % ids.length];
  }
  if (id !== 'auto') return SCENES[id] ? id : DEFAULT_SCENE;
  const h = date.getHours();
  if (h >= 5 && h < 10) return 'meadow';
  if (h >= 10 && h < 15) return 'tide';
  if (h >= 15 && h < 18) return 'dune';
  if (h >= 18 && h < 20) return 'bloom';
  return 'dusk';
}

// A small CSS stand-in for a scene, for pickers, angled like its composition.
export function scenePreview(scene) {
  if (scene.preview) return scene.preview;
  const [a, b, c, d] = scene.washes.map((w) => w.c);
  const angle = { valley: '180deg', horizon: '180deg', dunes: scene.mirror ? '200deg' : '160deg', sky: '0deg' }[scene.form] || (scene.mirror ? '215deg' : '145deg');
  return `linear-gradient(${angle}, ${scene.paper} 0 46%, ${a} 46% 58%, ${b} 58% 70%, ${c} 70% 84%, ${d} 84%)`;
}

export const SURPRISE_PREVIEW = 'conic-gradient(from 200deg at 62% 58%, #a9bb98, #f4a7bf, #72afa8, #ff4fd8, #ddba96, #1d58c4, #ab98cc, #a9bb98)';

// The seed a scene is painted with: its own, moved by Shuffle, and by the day
// when the theme is a surprise.
export function sceneSeed(scene, shuffle = 0, surprise = false, date = new Date()) {
  return (scene.seed + Math.imul(shuffle, 7919) + (surprise ? Math.imul(dayNumber(date), 104729) : 0)) >>> 0;
}

export const AUTO_PREVIEW = 'linear-gradient(115deg, #f2ede3 0 22%, #a3bcc7 22% 40%, #ddba96 40% 58%, #e2b9bf 58% 72%, #3a3154 72%)';

export function sceneOf(id) {
  return SCENES[id] || SCENES[DEFAULT_SCENE];
}

// Each layout drawn as boxes, in percent of the preview: [left, top, width, height, isPage].
export const LAYOUTS = [
  { id: "top", name: "Top tabs", hint: "Like Opera Air", boxes: [[4, 5, 24, 9], [4, 17, 92, 10], [3, 46, 7, 26], [13, 32, 83, 62, 1]] },
  { id: "sidebar", name: "Sidebar", hint: "Tabs down the side", boxes: [[4, 6, 26, 88], [34, 12, 62, 82, 1]] },
  { id: "compact", name: "Compact", hint: "Icons only", boxes: [[4, 6, 9, 88], [17, 12, 79, 82, 1]] },
  { id: "hidden", name: "Auto-hide", hint: "Appears at the edge", boxes: [[4, 12, 92, 82, 1], [0, 6, 2.5, 88]] },
];
