/* Primnox's Nimbus - Site Script */
import { SCENES, DEFAULT_SCENE } from "./nimbus/scenes.mjs";
import { paintScene } from "./nimbus/wash.mjs";
import { Ambient } from "./nimbus/ambient.mjs";

// Scene lengths in viewport heights. Their sum sets the scroll track's
// height, so the story always ends before the download section begins.
const SCENE_LENGTHS = [1.2, 3.3, 1.6, 1.4, 1.3, 1.3, 1.2, 1.3, 1.1, 1.0, 1.0, 1.2, 1.4];
document.getElementById('scroll-track').style.height = `${SCENE_LENGTHS.reduce((a, b) => a + b, 0) * 100}vh`;

const CAPTIONS = [
  { title: "Primnox's Nimbus", text: "A browser for Windows, built on Firefox." },
  { title: "Eleven paintings", text: "Each one is painted fresh on your computer and moves in its own way." },
  { title: "Tabs where you want them", text: "Across the top, down a sidebar, as a slim rail of icons, or hidden until your pointer reaches the edge." },
  { title: "Workspaces", text: "Separate sets of tabs for home, study and work, each with its own painting if you like. Alt+1 to Alt+9 switches." },
  { title: "Link peek", text: "Alt+click a link and it opens in a card over the page. Keep it as a tab, or put it beside the page." },
  { title: "A notebook", text: "Save pages to read later and keep notes beside what you're reading. Ctrl+Shift+L." },
  { title: "Hide what bothers you", text: "Right-click any part of a page and hide it on that site for good." },
  { title: "Mouse gestures", text: "Hold the right button and draw. Left goes back, down then right closes the tab." },
  { title: "Two pages at once", text: "Split view puts pages side by side, in any layout." },
  { title: "Ads blocked", text: "Built in, YouTube included." },
  { title: "Media controls", text: "Whatever is playing, in a tab or another app, in one small player." },
  { title: "Private", text: "No AI features. Nothing is sent to Mozilla." },
  { title: "Primnox's Nimbus 1.0.3", text: "For Windows 10 and 11. 93 MB." }
];

// The version and size come from the latest release, so the page never shows
// an old one. The text above and in index.html is only the fallback.
fetch('https://api.github.com/repos/Primnox/nimbus/releases/latest')
  .then((r) => (r.ok ? r.json() : null))
  .then((release) => {
    const match = release && /^v?(\d+(?:\.\d+)*)$/.exec(release.tag_name || '');
    if (!match) return;
    const version = match[1];
    const exe = (release.assets || []).find((a) => /\.exe$/i.test(a.name || ''));
    const getIt = CAPTIONS[CAPTIONS.length - 1];
    getIt.title = `Primnox's Nimbus ${version}`;
    if (exe) getIt.text = `For Windows 10 and 11. ${Math.round(exe.size / 1048576)} MB.`;
    document.getElementById('get-it-title').textContent = getIt.title;
    document.getElementById('get-it-text').textContent = getIt.text;
    document.getElementById('version-note').textContent = `Version ${version}. The installer isn't code-signed yet, so Windows may say it's from an unknown publisher.`;
  })
  .catch(() => {});

const THEME_KEYS = [
  'meadow', 'tide', 'dune', 'bloom', 'dusk', 'pine',
  'dawn', 'lagoon', 'lavender', 'ember', 'aurora'
];

// Motion preference check
const urlParams = new URLSearchParams(window.location.search);
const forceMotion = urlParams.get('motion') === 'full';
const storedMotion = localStorage.getItem('nimbus-site-motion') === 'full';
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let motionEnabled = forceMotion || storedMotion || !prefersReduced;

// DOM Elements
const stage = document.getElementById('stage');
const paintingCanvas = document.getElementById('painting-canvas');
const bloomCanvas = document.getElementById('bloom-canvas');
const tintLayer = document.getElementById('tint-layer');
const heroOverlay = document.getElementById('hero-overlay');
const heroLogoImg = document.getElementById('hero-logo-img');
const heroLogoBox = document.getElementById('hero-logo-box');
const heroCopy = document.getElementById('hero-copy');
const scrollHint = document.getElementById('scroll-hint');
const splashCanvas = document.getElementById('splash-canvas');
const windowScaler = document.getElementById('window-scaler');
const windowOutlineSvg = document.querySelector('.window-outline-svg');
const outlineRect = document.getElementById('outline-rect');
const mockWindow = document.getElementById('mock-window');
const winTopStrip = document.getElementById('win-top-strip');
const winAddressRow = document.getElementById('win-address-row');
const winSidebar = document.getElementById('win-sidebar');
const leftAppRail = document.getElementById('left-app-rail');
const pageViewport = document.getElementById('page-viewport');
const pageCard = document.getElementById('page-card');
const pageNewTab = document.getElementById('page-new-tab');
const pageScrollContent = document.getElementById('page-scroll-content');
const blogArchivePage = document.getElementById('blog-archive-page');
const pageSplitCard = document.getElementById('page-split-card');
const notebookPanel = document.getElementById('notebook-panel');
const nbTabRead = document.getElementById('nb-tab-read');
const nbTabNotes = document.getElementById('nb-tab-notes');
const btnSavePage = document.getElementById('btn-save-page');
const savedPageItem = document.getElementById('saved-page-item');
const readLaterList = document.getElementById('read-later-list');
const notesView = document.getElementById('notes-view');
const typedText = document.getElementById('typed-text');
const linkPeekCard = document.getElementById('link-peek-card');
const bannerAd = document.getElementById('banner-ad');
const contextMenu = document.getElementById('context-menu');
const gestureOverlay = document.getElementById('gesture-overlay');
const gesturePath = document.getElementById('gesture-path');
const gestureArrow = document.getElementById('gesture-arrow');
const gesturePill = document.getElementById('gesture-pill');
const gestureMouse = document.getElementById('gesture-mouse');
const bubbleParticles = document.getElementById('bubble-particles');
const shieldWrap = document.getElementById('shield-wrap');
const sideAd1 = document.getElementById('side-ad-1');
const sideAd2 = document.getElementById('side-ad-2');
const sideAd3 = document.getElementById('side-ad-3');
const mediaPlayerPill = document.getElementById('media-player-pill');
const sparkleWrap = document.getElementById('sparkle-wrap');
const brushStroke = document.getElementById('brush-stroke');
const envelopesLayer = document.getElementById('envelopes-layer');
const getItOverlay = document.getElementById('get-it-overlay');
const getItLogo = document.getElementById('get-it-logo');
const winCursor = document.getElementById('win-cursor');
const cursorKeycap = document.getElementById('cursor-keycap');
const clickRipple = document.getElementById('click-ripple');
const tabPrimary = document.getElementById('tab-primary');
const tabPrimaryTitle = document.getElementById('tab-primary-title');
const tabSecondary = document.getElementById('tab-secondary');
const tabFaviconSpot = document.getElementById('tab-favicon-spot');
const chipHome = document.getElementById('chip-home');
const chipStudy = document.getElementById('chip-study');
const chipWork = document.getElementById('chip-work');
const chipKeycap = document.getElementById('chip-keycap');
const captionPanel = document.getElementById('caption-panel');
const captionTitle = document.getElementById('caption-title');
const captionText = document.getElementById('caption-text');
const captionLive = document.getElementById('caption-live');
const motionToggle = document.getElementById('motion-toggle');
const downloadSection = document.getElementById('download-section');
const urlText = document.getElementById('url-text');

// Initialize Ambient Particles
const ambient = new Ambient(document);
// Insert ambient.canvas behind tint and window
stage.insertBefore(ambient.canvas, tintLayer);
// Append ambient.front above window
stage.appendChild(ambient.front);
ambient.showFront(true);
if (motionEnabled) {
  ambient.run(true);
} else {
  ambient.run(false);
  ambient.still();
}

// Reduced motion button setup
if (!motionEnabled) {
  motionToggle.hidden = false;
  motionToggle.addEventListener('click', () => {
    localStorage.setItem('nimbus-site-motion', 'full');
    motionEnabled = true;
    motionToggle.hidden = true;
    ambient.run(true);
  });
}

// Painting & Bloom Canvas Setup
const paintingCtx = paintingCanvas.getContext('2d');
const bloomCtx = bloomCanvas.getContext('2d');
const cachedImages = new Map();
let currentThemeId = 'meadow';
let isBlooming = false;

function resizeCanvases() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  paintingCanvas.width = w;
  paintingCanvas.height = h;
  bloomCanvas.width = w;
  bloomCanvas.height = h;
  if (cachedImages.has(currentThemeId)) {
    paintingCtx.drawImage(cachedImages.get(currentThemeId), 0, 0, w, h);
  }
}

// Window Scaling to design size (1040x650)
function updateWindowScale() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.min(1040, vw * 0.92);
  const maxH = Math.min(650, vh - 130);
  const scale = Math.max(0.3, Math.min(maxW / 1040, maxH / 650));
  document.documentElement.style.setProperty('--win-scale', scale.toFixed(4));
}

window.addEventListener('resize', () => {
  resizeCanvases();
  updateWindowScale();
});
resizeCanvases();
updateWindowScale();

// Preload watercolor themes
async function loadThemeImage(id) {
  if (cachedImages.has(id)) return cachedImages.get(id);
  const scene = SCENES[id] || SCENES[DEFAULT_SCENE];
  const url = await paintScene(document, id, scene, scene.seed, 1600, 1000);
  const img = new Image();
  img.src = url;
  await img.decode();
  cachedImages.set(id, img);
  return img;
}

async function preloadAllThemes() {
  const first = await loadThemeImage('meadow');
  paintingCtx.drawImage(first, 0, 0, paintingCanvas.width, paintingCanvas.height);

  const remaining = THEME_KEYS.filter((k) => k !== 'meadow');
  for (const key of remaining) {
    if ('requestIdleCallback' in window) {
      await new Promise((r) => requestIdleCallback(r));
    } else {
      await new Promise((r) => setTimeout(r, 60));
    }
    try {
      await loadThemeImage(key);
    } catch (e) {
      // Keep going
    }
  }
}
preloadAllThemes();

// Watercolor Bloom Transition
async function triggerBloomTransition(themeId) {
  if (themeId === currentThemeId && !isBlooming) return;
  const targetImg = await loadThemeImage(themeId);
  currentThemeId = themeId;
  const scene = SCENES[themeId] || SCENES[DEFAULT_SCENE];
  ambient.set(scene.ambient, scene);
  if (!motionEnabled) {
    ambient.still();
  }

  if (!motionEnabled) {
    // Simple crossfade for reduced motion
    const w = paintingCanvas.width;
    const h = paintingCanvas.height;
    paintingCtx.drawImage(targetImg, 0, 0, w, h);
    return;
  }

  isBlooming = true;
  const w = bloomCanvas.width;
  const h = bloomCanvas.height;
  const count = 7;
  const blobs = [];
  for (let i = 0; i < count; i++) {
    blobs.push({
      cx: w * (0.15 + Math.random() * 0.7),
      cy: h * (0.15 + Math.random() * 0.7),
      maxR: Math.hypot(w, h) * (0.55 + Math.random() * 0.25),
      seed: Math.random() * 100,
    });
  }

  const duration = 1200;
  const startTime = performance.now();

  function renderBloom(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out

    bloomCtx.clearRect(0, 0, w, h);
    bloomCtx.save();
    bloomCtx.drawImage(targetImg, 0, 0, w, h);
    bloomCtx.globalCompositeOperation = 'destination-in';
    bloomCtx.filter = 'blur(16px)';

    bloomCtx.fillStyle = '#ffffff';
    blobs.forEach((b) => {
      const r = ease * b.maxR;
      bloomCtx.beginPath();
      const points = 36;
      for (let p = 0; p <= points; p++) {
        const theta = (p / points) * Math.PI * 2;
        const wobble = 1 + 0.14 * Math.sin(theta * 3 + b.seed) + 0.08 * Math.cos(theta * 5 + b.seed);
        const rad = r * wobble;
        const px = b.cx + Math.cos(theta) * rad;
        const py = b.cy + Math.sin(theta) * rad;
        if (p === 0) bloomCtx.moveTo(px, py);
        else bloomCtx.lineTo(px, py);
      }
      bloomCtx.closePath();
      bloomCtx.fill();
    });
    bloomCtx.restore();

    if (progress < 1) {
      requestAnimationFrame(renderBloom);
    } else {
      paintingCtx.drawImage(targetImg, 0, 0, w, h);
      bloomCtx.clearRect(0, 0, w, h);
      isBlooming = false;
    }
  }

  requestAnimationFrame(renderBloom);
}

// Parallax pointer tracking
window.addEventListener('pointermove', (e) => {
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = (e.clientY / window.innerHeight) * 2 - 1;
  ambient.lookAt(nx, ny);
  paintingCanvas.style.transform = `scale(1.04) translate(${-nx * 8}px, ${-ny * 6}px)`;
  bloomCanvas.style.transform = `scale(1.04) translate(${-nx * 8}px, ${-ny * 6}px)`;
});

// Pause ambient on visibility change
document.addEventListener('visibilitychange', () => {
  ambient.run(!document.hidden && motionEnabled);
});

// Intro Drop Animation (Scene 0)
function playIntroDrops() {
  if (!motionEnabled) {
    heroLogoImg.style.opacity = '1';
    heroLogoImg.style.transform = 'scale(1)';
    return;
  }

  const sCtx = splashCanvas.getContext('2d');
  const drops = [
    { targetX: 75, targetY: 135, color: '#cbd5bd', radius: 24, startDelay: 0 },
    { targetX: 115, targetY: 95, color: '#a9bb98', radius: 28, startDelay: 60 },
    { targetX: 120, targetY: 130, color: '#86a078', radius: 30, startDelay: 120 },
    { targetX: 160, targetY: 105, color: '#5f7d58', radius: 26, startDelay: 180 },
    { targetX: 155, targetY: 140, color: '#5b7a52', radius: 22, startDelay: 240 },
  ];

  const startTime = performance.now();
  const dropDuration = 500;
  const totalDuration = 2000;

  function renderIntro(now) {
    const elapsed = now - startTime;
    sCtx.clearRect(0, 0, 240, 240);
    sCtx.filter = 'blur(6px)';

    drops.forEach((d) => {
      const dropElapsed = Math.max(0, elapsed - d.startDelay);
      if (dropElapsed < dropDuration) {
        const p = dropElapsed / dropDuration;
        const curY = -20 + (d.targetY + 20) * (p * p);
        sCtx.fillStyle = d.color;
        sCtx.beginPath();
        sCtx.arc(d.targetX, curY, 8 * (1 - p * 0.2), 0, Math.PI * 2);
        sCtx.fill();
      } else {
        const expandElapsed = dropElapsed - dropDuration;
        const ep = Math.min(1, expandElapsed / 400);
        sCtx.fillStyle = d.color;
        sCtx.beginPath();
        sCtx.arc(d.targetX, d.targetY, d.radius * ep, 0, Math.PI * 2);
        sCtx.fill();
      }
    });

    if (elapsed > 1200) {
      const logoP = Math.min(1, (elapsed - 1200) / 700);
      heroLogoImg.style.opacity = `${logoP}`;
      heroLogoImg.style.transform = `scale(${0.85 + 0.15 * logoP})`;
    }

    if (elapsed < totalDuration) {
      requestAnimationFrame(renderIntro);
    } else {
      sCtx.clearRect(0, 0, 240, 240);
      heroLogoImg.style.opacity = '1';
      heroLogoImg.style.transform = 'scale(1)';
    }
  }

  requestAnimationFrame(renderIntro);
}
playIntroDrops();

// Scene Controllers
export const scenes = [
  // Scene 0: Hello
  {
    apply(t) {
      captionPanel.classList.remove('visible');

      if (t >= 1) {
        heroOverlay.style.display = 'none';
        heroOverlay.style.opacity = '0';
        heroOverlay.style.pointerEvents = 'none';
        heroLogoImg.style.opacity = '0';
        tabFaviconSpot.innerHTML = '<img src="nimbus.svg" class="tab-flying-logo" alt="Nimbus logo">';
        mockWindow.style.opacity = '1';
        mockWindow.style.display = '';
        windowOutlineSvg.style.opacity = '0';
        return;
      }

      heroOverlay.style.display = 'flex';
      heroOverlay.style.opacity = '1';
      const heroP = Math.max(0, 1 - t * 2.2);
      heroCopy.style.opacity = `${heroP}`;
      heroCopy.style.transform = `translateY(${-40 * t}px)`;
      scrollHint.style.opacity = `${Math.max(0, 1 - t * 3)}`;
      heroOverlay.style.pointerEvents = t < 0.25 ? 'auto' : 'none';

      // Outline rect stroke draws itself
      const drawP = Math.min(1, Math.max(0, (t - 0.15) / 0.45));
      outlineRect.style.strokeDashoffset = `${3372 * (1 - drawP)}`;
      windowOutlineSvg.style.opacity = `${t < 0.8 ? Math.min(1, t / 0.15) : Math.max(0, (1 - t) / 0.2)}`;

      // Glass fill
      const glassP = Math.min(1, Math.max(0, (t - 0.45) / 0.4));
      mockWindow.style.display = '';
      mockWindow.style.opacity = `${glassP}`;
      mockWindow.style.transform = 'scale(1)';

      // Logo shrink and fly into tab favicon spot
      if (t < 0.5) {
        heroLogoImg.style.transform = 'scale(1)';
        heroLogoImg.style.opacity = '1';
        tabFaviconSpot.innerHTML = '<span class="tab-favicon-dot"></span>';
      } else {
        const flyP = Math.min(1, (t - 0.5) / 0.48);
        const ease = flyP * flyP * (3 - 2 * flyP);
        const rectBox = heroLogoBox.getBoundingClientRect();
        const rectTab = tabFaviconSpot.getBoundingClientRect();
        const boxCenterX = rectBox.left + rectBox.width / 2;
        const boxCenterY = rectBox.top + rectBox.height / 2;
        const tabCenterX = rectTab.left + rectTab.width / 2;
        const tabCenterY = rectTab.top + rectTab.height / 2;
        const dx = tabCenterX - boxCenterX;
        const dy = tabCenterY - boxCenterY;
        const targetScale = rectTab.width > 0 ? (rectTab.width / 120) : 0.1167;
        const curScale = 1 + (targetScale - 1) * ease;
        const curDx = dx * ease;
        const curDy = dy * ease;

        if (flyP >= 0.98) {
          heroLogoImg.style.opacity = '0';
          tabFaviconSpot.innerHTML = '<img src="nimbus.svg" class="tab-flying-logo" alt="Nimbus logo">';
        } else {
          heroLogoImg.style.opacity = '1';
          heroLogoImg.style.transform = `translate(${curDx}px, ${curDy}px) scale(${curScale})`;
          tabFaviconSpot.innerHTML = '<span class="tab-favicon-dot"></span>';
        }
      }
    },
    rest() {
      heroOverlay.style.display = 'none';
      heroOverlay.style.opacity = '0';
      heroOverlay.style.pointerEvents = 'none';
      heroLogoImg.style.opacity = '0';
      heroLogoImg.style.transform = 'scale(1)';
      windowOutlineSvg.style.opacity = '0';
      outlineRect.style.strokeDashoffset = '0';
      mockWindow.style.opacity = '1';
      mockWindow.style.display = '';
      mockWindow.style.transform = 'scale(1)';
      tabFaviconSpot.innerHTML = '<img src="nimbus.svg" class="tab-flying-logo" alt="Nimbus logo">';
      captionPanel.classList.remove('visible');
    }
  },

  // Scene 1: Paintings
  {
    apply(t) {
      mockWindow.style.opacity = '1';
      mockWindow.style.display = '';
      pageCard.style.display = 'none';
      pageNewTab.style.display = 'flex';
      pageNewTab.classList.add('show');
      const idx = Math.min(10, Math.floor(t * 11));
      const themeKey = THEME_KEYS[idx];
      triggerBloomTransition(themeKey);
      const scene = SCENES[themeKey];
      captionLive.textContent = `${scene.name}. ${scene.mood}`;
    },
    rest() {
      pageNewTab.classList.remove('show');
      pageNewTab.style.display = 'none';
      pageCard.style.display = 'flex';
      pageCard.style.opacity = '1';
      captionLive.textContent = '';
    }
  },

  // Scene 2: Layouts
  {
    apply(t) {
      triggerBloomTransition('meadow');
      if (t < 0.25) {
        // Top tabs
        winTopStrip.classList.remove('hidden');
        winAddressRow.classList.remove('hidden');
        winSidebar.classList.remove('visible', 'compact', 'autohide-peek');
        winSidebar.style.transform = 'translateX(-240px)';
        winSidebar.style.opacity = '0';
        winSidebar.style.boxShadow = '';
        winSidebar.style.width = '210px';
        leftAppRail.style.width = '36px';
        leftAppRail.style.opacity = '1';
        pageViewport.style.marginLeft = '0';
        winCursor.style.opacity = '0';
      } else if (t < 0.52) {
        // Sidebar layout
        winTopStrip.classList.add('hidden');
        winAddressRow.classList.add('hidden');
        winSidebar.classList.add('visible');
        winSidebar.classList.remove('compact', 'autohide-peek');
        winSidebar.style.width = '210px';
        winSidebar.style.transform = 'translateX(0)';
        winSidebar.style.opacity = '1';
        winSidebar.style.boxShadow = '';
        winSidebar.style.zIndex = '12';
        leftAppRail.style.width = '0';
        leftAppRail.style.opacity = '0';
        pageViewport.style.marginLeft = '218px';
        winCursor.style.opacity = '0';
      } else if (t < 0.75) {
        // Compact layout
        winTopStrip.classList.add('hidden');
        winAddressRow.classList.add('hidden');
        winSidebar.classList.add('visible', 'compact');
        winSidebar.classList.remove('autohide-peek');
        winSidebar.style.width = '52px';
        winSidebar.style.transform = 'translateX(0)';
        winSidebar.style.opacity = '1';
        winSidebar.style.boxShadow = '';
        winSidebar.style.zIndex = '12';
        leftAppRail.style.width = '0';
        leftAppRail.style.opacity = '0';
        pageViewport.style.marginLeft = '60px';
        winCursor.style.opacity = '0';
      } else {
        // Auto-hide layout
        winTopStrip.classList.add('hidden');
        winAddressRow.classList.add('hidden');
        winSidebar.classList.remove('compact');
        winSidebar.style.width = '210px';
        pageViewport.style.marginLeft = '0'; // Page takes full width
        leftAppRail.style.width = '0';
        leftAppRail.style.opacity = '0';

        if (t < 0.86) {
          // No sidebar and no top strip, full width
          winSidebar.classList.remove('visible', 'autohide-peek');
          winSidebar.style.transform = 'translateX(-240px)';
          winSidebar.style.opacity = '0';
          winSidebar.style.boxShadow = '';
          if (t >= 0.80) {
            const curP = (t - 0.80) / 0.06;
            winCursor.style.opacity = '1';
            winCursor.style.transform = `translate(${120 - 116 * curP}px, 260px)`;
          } else {
            winCursor.style.opacity = '0';
          }
        } else {
          // Near end of scene: pointer touches left edge, sidebar slides back in over page with soft shadow
          const peekP = Math.min(1, (t - 0.86) / 0.14);
          const ease = peekP * peekP * (3 - 2 * peekP);
          winSidebar.classList.add('visible', 'autohide-peek');
          winSidebar.style.transform = `translateX(${-210 + 210 * ease}px)`;
          winSidebar.style.opacity = '1';
          winSidebar.style.zIndex = '20';
          winSidebar.style.boxShadow = '8px 0 28px rgba(0, 0, 0, 0.22), 2px 0 8px rgba(0, 0, 0, 0.12)';
          winCursor.style.opacity = '1';
          winCursor.style.transform = `translate(${4 + 30 * ease}px, 260px)`;
        }
      }
    },
    rest() {
      winTopStrip.classList.remove('hidden');
      winAddressRow.classList.remove('hidden');
      winSidebar.classList.remove('visible', 'compact', 'autohide-peek');
      winSidebar.style.transform = 'translateX(-240px)';
      winSidebar.style.opacity = '0';
      winSidebar.style.boxShadow = '';
      winSidebar.style.width = '210px';
      leftAppRail.style.width = '36px';
      leftAppRail.style.opacity = '1';
      pageViewport.style.marginLeft = '0';
      winCursor.style.opacity = '0';
      triggerBloomTransition('meadow');
    }
  },

  // Scene 3: Workspaces
  {
    apply(t) {
      if (t < 0.33) {
        chipHome.classList.add('active');
        chipStudy.classList.remove('active');
        chipWork.classList.remove('active');
        chipKeycap.classList.remove('show');
        tabPrimaryTitle.textContent = "fieldnotes - Why watercolor blooms";
        triggerBloomTransition('meadow');
      } else if (t < 0.67) {
        chipHome.classList.remove('active');
        chipStudy.classList.add('active');
        chipWork.classList.remove('active');
        chipKeycap.textContent = "Alt+2";
        chipKeycap.classList.add('show');
        tabPrimaryTitle.textContent = "Study - Classical Mineral Washes";
        triggerBloomTransition('dusk');
      } else {
        chipHome.classList.remove('active');
        chipStudy.classList.remove('active');
        chipWork.classList.add('active');
        chipKeycap.textContent = "Alt+3";
        chipKeycap.classList.add('show');
        tabPrimaryTitle.textContent = "Work - Primnox Sprint Planning";
        triggerBloomTransition('tide');
      }
    },
    rest() {
      chipHome.classList.add('active');
      chipStudy.classList.remove('active');
      chipWork.classList.remove('active');
      chipKeycap.classList.remove('show');
      tabPrimaryTitle.textContent = "fieldnotes - Why watercolor blooms";
      triggerBloomTransition('meadow');
    }
  },

  // Scene 4: Link peek
  {
    apply(t) {
      winCursor.style.opacity = '1';
      const curX = 480 - 100 * Math.min(1, t / 0.24);
      const curY = 360 - 80 * Math.min(1, t / 0.24);
      winCursor.style.transform = `translate(${curX}px, ${curY}px)`;

      if (t >= 0.22) {
        cursorKeycap.classList.add('show');
      } else {
        cursorKeycap.classList.remove('show');
      }

      if (t >= 0.25 && t < 0.32) {
        clickRipple.classList.add('animate');
      } else {
        clickRipple.classList.remove('animate');
      }

      if (t >= 0.28) {
        // Grows to large card (~70% page area) by t = 0.6 and stays there until scene ends
        const p = Math.min(1, (t - 0.28) / 0.32);
        const ease = p * p * (3 - 2 * p);
        linkPeekCard.style.opacity = `${Math.min(1, p * 2.5)}`;
        linkPeekCard.style.transform = `scale(${0.2 + 0.8 * ease})`;
        pageScrollContent.style.filter = `brightness(${1 - 0.45 * ease}) blur(${2.5 * ease}px)`;
      } else {
        linkPeekCard.style.opacity = '0';
        linkPeekCard.style.transform = 'scale(0.2)';
        pageScrollContent.style.filter = 'none';
      }
    },
    rest() {
      winCursor.style.opacity = '0';
      cursorKeycap.classList.remove('show');
      clickRipple.classList.remove('animate');
      linkPeekCard.style.opacity = '0';
      linkPeekCard.style.transform = 'scale(0.2)';
      pageScrollContent.style.filter = 'none';
    }
  },

  // Scene 5: Notebook
  {
    apply(t) {
      winCursor.style.opacity = '1';
      if (t < 0.22) {
        const p = t / 0.22;
        notebookPanel.style.transform = `translateX(${100 * (1 - p)}%)`;
        winCursor.style.transform = `translate(${560 + 315 * p}px, ${240 - 172 * p}px)`;
        nbTabRead.classList.add('active');
        nbTabNotes.classList.remove('active');
        readLaterList.style.display = 'flex';
        notesView.style.display = 'none';
        savedPageItem.classList.remove('show');
        btnSavePage.style.transform = 'none';
      } else if (t < 0.42) {
        notebookPanel.style.transform = 'translateX(0)';
        winCursor.style.transform = 'translate(875px, 68px)';
        nbTabRead.classList.add('active');
        nbTabNotes.classList.remove('active');
        readLaterList.style.display = 'flex';
        notesView.style.display = 'none';
        const isClicking = (t >= 0.25 && t < 0.32);
        btnSavePage.style.transform = isClicking ? 'scale(0.96)' : 'none';
        if (t >= 0.28) {
          savedPageItem.classList.add('show');
        } else {
          savedPageItem.classList.remove('show');
        }
      } else if (t < 0.50) {
        notebookPanel.style.transform = 'translateX(0)';
        savedPageItem.classList.add('show');
        btnSavePage.style.transform = 'none';
        const p = (t - 0.42) / 0.08;
        winCursor.style.transform = `translate(${875 + 55 * p}px, ${68 - 48 * p}px)`;
        nbTabRead.classList.add('active');
        nbTabNotes.classList.remove('active');
        readLaterList.style.display = 'flex';
        notesView.style.display = 'none';
      } else {
        notebookPanel.style.transform = 'translateX(0)';
        savedPageItem.classList.add('show');
        btnSavePage.style.transform = 'none';
        nbTabRead.classList.remove('active');
        nbTabNotes.classList.add('active');
        readLaterList.style.display = 'none';
        notesView.style.display = 'flex';
        winCursor.style.transform = 'translate(860px, 220px)';

        const note = "Pigment settles in the dips of the paper. Try cold press next time.";
        const charP = Math.min(1, (t - 0.50) / 0.46);
        const chars = Math.floor(charP * note.length);
        typedText.textContent = note.slice(0, chars);
      }
    },
    rest() {
      notebookPanel.style.transform = 'translateX(100%)';
      nbTabRead.classList.add('active');
      nbTabNotes.classList.remove('active');
      readLaterList.style.display = 'flex';
      notesView.style.display = 'none';
      savedPageItem.classList.remove('show');
      btnSavePage.style.transform = 'none';
      typedText.textContent = '';
      winCursor.style.opacity = '0';
    }
  },

  // Scene 6: Hide what bothers you
  {
    apply(t) {
      winCursor.style.opacity = '1';
      if (t < 0.3) {
        const p = t / 0.3;
        winCursor.style.transform = `translate(${320 + 140 * p}px, ${280 - 130 * p}px)`;
        contextMenu.style.opacity = '0';
        contextMenu.style.transform = 'scale(0.9)';
      } else if (t < 0.55) {
        const p = (t - 0.3) / 0.25;
        contextMenu.style.left = '420px';
        contextMenu.style.top = '120px';
        contextMenu.style.opacity = '1';
        contextMenu.style.transform = 'scale(1)';
        winCursor.style.transform = `translate(490px, ${150 + 55 * p}px)`;
      } else {
        contextMenu.style.opacity = '0';
        winCursor.style.opacity = '0';
        const p = (t - 0.55) / 0.45;
        bannerAd.style.transform = `scale(${1 - p}) skewX(${p * 30}deg) rotate(${p * 12}deg)`;
        bannerAd.style.opacity = `${1 - p}`;
        bannerAd.style.maxHeight = `${Math.max(0, 60 * (1 - p))}px`;
        bannerAd.style.marginBottom = `${Math.max(0, 16 * (1 - p))}px`;
        bannerAd.style.padding = `${Math.max(0, 12 * (1 - p))}px 16px`;
      }
    },
    rest() {
      contextMenu.style.opacity = '0';
      winCursor.style.opacity = '0';
      bannerAd.style.transform = 'none';
      bannerAd.style.opacity = '1';
      bannerAd.style.maxHeight = '80px';
      bannerAd.style.marginBottom = '16px';
      bannerAd.style.padding = '12px 16px';
    }
  },

  // Scene 7: Mouse gestures
  {
    apply(t) {
      winCursor.style.opacity = '1';
      gestureMouse.style.opacity = '1';

      if (t < 0.5) {
        // Gesture 1: Leftward trail to go back
        const p = t / 0.5;
        const curX = 580 - 280 * p;
        const curY = 320;
        winCursor.style.transform = `translate(${curX}px, ${curY}px)`;
        gestureMouse.style.transform = `translate(${curX + 28}px, ${curY - 14}px)`;

        gesturePath.setAttribute('d', `M 580 320 L ${curX} 320`);
        gestureArrow.setAttribute('points', `${curX},320 ${curX + 14},314 ${curX + 14},326`);

        gesturePill.textContent = 'Back';
        gesturePill.style.left = `${curX + 26}px`;
        gesturePill.style.top = `${curY - 42}px`;
        gesturePill.style.opacity = p > 0.25 ? '1' : '0';

        if (p > 0.35) {
          const slideP = Math.min(1, (p - 0.35) / 0.45);
          const ease = slideP * slideP * (3 - 2 * slideP);
          pageScrollContent.style.transform = `translateX(${ease * 100}%)`;
          blogArchivePage.style.transform = `translateX(${-100 + ease * 100}%)`;
          urlText.textContent = 'fieldnotes.blog/';
        } else {
          pageScrollContent.style.transform = 'translateX(0)';
          blogArchivePage.style.transform = 'translateX(-100%)';
          urlText.textContent = 'fieldnotes.blog/why-watercolor-blooms';
        }
      } else {
        // Gesture 2: Down then right to close tab
        pageScrollContent.style.transform = 'translateX(100%)';
        blogArchivePage.style.transform = 'translateX(0)';
        urlText.textContent = 'fieldnotes.blog/';

        const p = (t - 0.5) / 0.5;
        let curX = 440;
        let curY = 200;
        let pathD = 'M 440 200 ';
        if (p < 0.5) {
          const p1 = p / 0.5;
          curY = 200 + 120 * p1;
          pathD += `L 440 ${curY}`;
          gestureArrow.setAttribute('points', `440,${curY} 434,${curY - 14} 446,${curY - 14}`);
        } else {
          const p2 = (p - 0.5) / 0.5;
          curY = 320;
          curX = 440 + 140 * p2;
          pathD += `L 440 320 L ${curX} 320`;
          gestureArrow.setAttribute('points', `${curX},320 ${curX - 14},314 ${curX - 14},326`);
        }

        winCursor.style.transform = `translate(${curX}px, ${curY}px)`;
        gestureMouse.style.transform = `translate(${curX + 28}px, ${curY - 14}px)`;
        gesturePath.setAttribute('d', pathD);

        gesturePill.textContent = 'Close Tab';
        gesturePill.style.left = `${curX + 24}px`;
        gesturePill.style.top = `${curY - 42}px`;
        gesturePill.style.opacity = '1';

        if (p > 0.5) {
          const closeP = Math.min(1, (p - 0.5) / 0.45);
          const ease = closeP * closeP;
          tabPrimary.style.maxWidth = `${220 * (1 - ease)}px`;
          tabPrimary.style.opacity = `${1 - ease}`;
          tabPrimary.style.transform = `scale(${1 - 0.6 * ease})`;
          tabPrimary.style.padding = `0 ${10 * (1 - ease)}px`;
          tabPrimary.style.marginRight = `${-4 * ease}px`;
          if (closeP >= 0.98) {
            tabPrimary.style.display = 'none';
          } else {
            tabPrimary.style.display = 'inline-flex';
          }
          tabSecondary.classList.add('active');
          tabPrimary.classList.remove('active');
        }
      }
    },
    rest() {
      winCursor.style.opacity = '0';
      gestureMouse.style.opacity = '0';
      gesturePill.style.opacity = '0';
      gesturePath.setAttribute('d', '');
      gestureArrow.setAttribute('points', '0,0 0,0 0,0');
      pageScrollContent.style.transform = 'translateX(0)';
      blogArchivePage.style.transform = 'translateX(-100%)';
      urlText.textContent = 'fieldnotes.blog/why-watercolor-blooms';
      tabPrimary.style.display = 'inline-flex';
      tabPrimary.style.maxWidth = '220px';
      tabPrimary.style.opacity = '1';
      tabPrimary.style.transform = 'none';
      tabPrimary.style.padding = '0 10px';
      tabPrimary.style.marginRight = '0';
      tabSecondary.classList.remove('active');
      tabPrimary.classList.add('active');
    }
  },

  // Scene 8: Two pages at once
  {
    apply(t) {
      pageCard.style.width = `${100 - 51 * t}%`;
      pageSplitCard.style.transform = `translateX(${110 * (1 - t)}%)`;
    },
    rest() {
      pageCard.style.width = '100%';
      pageSplitCard.style.transform = 'translateX(110%)';
    }
  },

  // Scene 9: Ads blocked
  {
    apply(t) {
      const ads = [bannerAd, sideAd1, sideAd2, sideAd3];
      const thresholds = [0.2, 0.4, 0.6, 0.8];

      ads.forEach((ad, i) => {
        const th = thresholds[i];
        if (t >= th) {
          const p = Math.min(1, (t - th) / 0.15);
          if (p < 0.4) {
            ad.style.transform = `scale(${1 + 0.15 * (p / 0.4)})`;
            ad.style.opacity = '1';
          } else {
            ad.style.transform = 'scale(0)';
            ad.style.opacity = '0';
          }
        } else {
          ad.style.transform = 'scale(1)';
          ad.style.opacity = '1';
        }
      });

      const isNearPop = thresholds.some((th) => Math.abs(t - th) < 0.06);
      shieldWrap.classList.toggle('pulse', isNearPop);
    },
    rest() {
      bannerAd.style.transform = 'none';
      bannerAd.style.opacity = '1';
      [sideAd1, sideAd2, sideAd3].forEach((ad) => {
        ad.style.transform = 'none';
        ad.style.opacity = '1';
      });
      shieldWrap.classList.remove('pulse');
    }
  },

  // Scene 10: Media controls
  {
    apply(t) {
      mediaPlayerPill.classList.toggle('show', t > 0.15);
      tintLayer.style.opacity = `${t * 0.6}`;
    },
    rest() {
      mediaPlayerPill.classList.remove('show');
      tintLayer.style.opacity = '0';
    }
  },

  // Scene 11: Private
  {
    apply(t) {
      sparkleWrap.classList.toggle('show', t > 0.08);

      if (t > 0.40) {
        const wipeP = Math.min(1, (t - 0.40) / 0.35);
        brushStroke.style.transform = `scaleX(${wipeP})`;
        if (wipeP >= 0.92) {
          sparkleWrap.style.opacity = '0';
        } else {
          sparkleWrap.style.opacity = '1';
        }
      } else {
        brushStroke.style.transform = 'scaleX(0)';
        sparkleWrap.style.opacity = '1';
      }

      // Stream of 10 envelopes leaving from varied points across the page
      if (t > 0.05) {
        const streamPoints = [
          { startX: 160, startY: 480, delay: 0.00 },
          { startX: 340, startY: 260, delay: 0.035 },
          { startX: 620, startY: 440, delay: 0.07 },
          { startX: 220, startY: 360, delay: 0.105 },
          { startX: 480, startY: 520, delay: 0.14 },
          { startX: 800, startY: 320, delay: 0.175 },
          { startX: 280, startY: 180, delay: 0.21 },
          { startX: 520, startY: 380, delay: 0.245 },
          { startX: 180, startY: 540, delay: 0.28 },
          { startX: 720, startY: 200, delay: 0.315 }
        ];

        if (envelopesLayer.children.length !== 20) {
          envelopesLayer.innerHTML = '';
          for (let i = 0; i < 10; i++) {
            const env = document.createElement('div');
            env.className = 'envelope-item';
            env.innerHTML = '<svg viewBox="0 0 24 18" width="32" height="24" fill="none" stroke="#4a6343" stroke-width="1.6"><rect x="1" y="1" width="22" height="16" rx="2"/><polyline points="2 2 12 10 22 2"/></svg>';
            envelopesLayer.appendChild(env);
          }
          const dropColors = ['#5b7a52', '#86a078', '#a9bb98', '#4f726c', '#608575', '#7a9e6e', '#5b8a72', '#6b9278', '#557d5e', '#67906d'];
          for (let i = 0; i < 10; i++) {
            const drop = document.createElement('div');
            drop.className = 'watercolor-drop';
            drop.style.background = dropColors[i];
            envelopesLayer.appendChild(drop);
          }
        }

        const envItems = envelopesLayer.querySelectorAll('.envelope-item');
        const dropItems = envelopesLayer.querySelectorAll('.watercolor-drop');

        for (let i = 0; i < 10; i++) {
          const env = envItems[i];
          const drop = dropItems[i];
          const pt = streamPoints[i];
          const ep = Math.min(1, Math.max(0, (t - 0.05 - pt.delay) / 0.44));
          const apexX = 850 + (i % 3) * 24;
          const apexY = 28 + (i % 4) * 12;

          if (ep <= 0) {
            env.style.opacity = '0';
            drop.style.opacity = '0';
          } else if (ep < 0.72) {
            const curX = pt.startX + (apexX - pt.startX) * ep;
            const curY = pt.startY + (apexY - pt.startY) * ep - 75 * Math.sin(ep * Math.PI);
            const rot = -12 + ep * 36;
            env.style.transform = `translate(${curX}px, ${curY}px) rotate(${rot}deg)`;
            env.style.opacity = '1';
            drop.style.opacity = '0';
          } else {
            const disP = (ep - 0.72) / 0.28;
            env.style.transform = `translate(${apexX}px, ${apexY}px) scale(${1 - 0.5 * disP})`;
            env.style.opacity = `${Math.max(0, 1 - disP * 2.5)}`;

            // Watercolor drop emerges and falls back into the painting
            const fallY = apexY + 180 * (disP * disP);
            const dropScale = 0.8 + 0.6 * Math.sin(disP * Math.PI);
            drop.style.transform = `translate(${apexX + 11}px, ${fallY}px) scale(${dropScale})`;
            drop.style.opacity = `${Math.min(1, disP * 2) * (1 - disP * 0.35)}`;
          }
        }
      } else {
        envelopesLayer.innerHTML = '';
      }
    },
    rest() {
      sparkleWrap.classList.remove('show');
      sparkleWrap.style.opacity = '1';
      brushStroke.style.transform = 'scaleX(0)';
      envelopesLayer.innerHTML = '';
    }
  },

  // Scene 12: Get it
  {
    apply(t) {
      triggerBloomTransition('meadow');
      captionPanel.classList.remove('visible');

      // Window shrinks toward center (down to 0.12 by t = 0.7) while fading
      if (t < 0.7) {
        const p = t / 0.7;
        const ease = p * p * (3 - 2 * p);
        const winScale = 1.0 - (1.0 - 0.12) * ease;
        const winOpacity = Math.max(0, 1.0 - Math.pow(p, 1.15));

        mockWindow.style.transform = `scale(${winScale.toFixed(4)})`;
        mockWindow.style.opacity = winOpacity.toFixed(4);
        mockWindow.style.display = winOpacity <= 0.002 ? 'none' : '';

        // Logo grows in at center to 160px (scale 1), with title, text and button under it
        const logoScale = 0.25 + 0.75 * ease;
        getItLogo.style.transform = `scale(${logoScale.toFixed(4)})`;
        getItOverlay.style.display = 'flex';
        getItOverlay.classList.add('show');
        getItOverlay.style.opacity = `${Math.min(1, ease * 1.6)}`;
        getItOverlay.style.pointerEvents = ease > 0.8 ? 'auto' : 'none';
      } else {
        // By t = 1 (and for t >= 0.7), nothing of the window remains
        mockWindow.style.transform = 'scale(0.12)';
        mockWindow.style.opacity = '0';
        mockWindow.style.display = 'none';

        getItLogo.style.transform = 'scale(1)';
        getItOverlay.style.display = 'flex';
        getItOverlay.classList.add('show');
        getItOverlay.style.opacity = '1';
        getItOverlay.style.pointerEvents = 'auto';
      }
    },
    rest() {
      mockWindow.style.transform = 'scale(1)';
      mockWindow.style.opacity = '1';
      mockWindow.style.display = '';
      getItLogo.style.transform = 'scale(1)';
      getItOverlay.style.display = 'none';
      getItOverlay.style.opacity = '0';
      getItOverlay.classList.remove('show');
      getItOverlay.style.pointerEvents = 'none';
    }
  }
];

// Scroll Engine
let smoothedScrollY = window.scrollY;
let activeSceneIndex = -1;
let captionTimer = null;

function getSceneOffsets() {
  const vh = window.innerHeight;
  const offsets = [];
  let cum = 0;
  for (let i = 0; i < SCENE_LENGTHS.length; i++) {
    const len = SCENE_LENGTHS[i] * vh;
    offsets.push({ start: cum, end: cum + len, len });
    cum += len;
  }
  return offsets;
}

function updateCaption(index) {
  if (captionTimer) {
    clearTimeout(captionTimer);
    captionTimer = null;
  }
  if (index === 0 || index === 12) {
    captionPanel.classList.remove('visible');
    return;
  }
  const cap = CAPTIONS[index];
  if (!cap) return;
  captionPanel.classList.remove('visible');
  captionTimer = setTimeout(() => {
    if (activeSceneIndex === 0 || activeSceneIndex === 12) {
      captionPanel.classList.remove('visible');
      return;
    }
    captionTitle.textContent = cap.title;
    captionText.textContent = cap.text;
    if (index !== 1) {
      captionLive.textContent = '';
    }
    captionPanel.classList.add('visible');
  }, 150);
}

function tickEngine() {
  const targetScrollY = window.scrollY;
  smoothedScrollY += (targetScrollY - smoothedScrollY) * 0.18;

  const offsets = getSceneOffsets();
  let currentIdx = 0;
  let currentT = 0;

  for (let i = 0; i < offsets.length; i++) {
    const off = offsets[i];
    if (smoothedScrollY >= off.start && smoothedScrollY < off.end) {
      currentIdx = i;
      currentT = Math.max(0, Math.min(1, (smoothedScrollY - off.start) / off.len));
      break;
    }
    if (i === offsets.length - 1 && smoothedScrollY >= off.end) {
      currentIdx = offsets.length - 1;
      currentT = 1;
    }
  }

  if (currentIdx !== activeSceneIndex) {
    for (let i = 0; i < scenes.length; i++) {
      if (i !== currentIdx && scenes[i] && scenes[i].rest) {
        scenes[i].rest();
      }
    }
    activeSceneIndex = currentIdx;
    updateCaption(currentIdx);
  }

  if (scenes[currentIdx] && scenes[currentIdx].apply) {
    scenes[currentIdx].apply(currentT);
  }

  // Handle download section visibility
  if (downloadSection) {
    // Keep stage fixed underneath, running particles on Sage
    stage.style.opacity = '1';
    stage.style.display = 'flex';

    const dRect = downloadSection.getBoundingClientRect();
    const vh = window.innerHeight;

    // As download section scrolls into the viewport, smoothly fade out getItOverlay
    // so it doesn't overlap the centered frosted download card
    if (dRect.top < vh) {
      const fadeP = Math.max(0, Math.min(1, (dRect.top - vh * 0.15) / (vh * 0.45)));
      if (activeSceneIndex === 12) {
        if (fadeP <= 0.01) {
          getItOverlay.style.display = 'none';
          getItOverlay.style.opacity = '0';
        } else {
          getItOverlay.style.opacity = `${fadeP}`;
        }
      }
    }
  }

  requestAnimationFrame(tickEngine);
}
requestAnimationFrame(tickEngine);

// Jump method for screenshots & URL params
function go(sceneIndex, t = 0) {
  const offsets = getSceneOffsets();
  if (sceneIndex < 0 || sceneIndex >= offsets.length) return;
  const targetY = offsets[sceneIndex].start + t * offsets[sceneIndex].len;
  window.scrollTo({ top: targetY, behavior: 'instant' });
  smoothedScrollY = targetY;

  // Restore stage display in case it was scrolled past
  stage.style.display = 'flex';
  stage.style.opacity = '1';

  for (let i = 0; i < scenes.length; i++) {
    if (i !== sceneIndex && scenes[i] && scenes[i].rest) {
      scenes[i].rest();
    }
  }
  activeSceneIndex = sceneIndex;
  updateCaption(sceneIndex);
  scenes[sceneIndex].apply(t);
}

// Expose on window
window.__site = {
  scenes,
  go
};

// URL parameters initial jump
const sceneParam = urlParams.get('scene');
const tParam = urlParams.get('t');
if (sceneParam !== null) {
  const sIdx = parseInt(sceneParam, 10);
  const tVal = tParam !== null ? parseFloat(tParam) : 0;
  setTimeout(() => {
    go(sIdx, tVal);
  }, 80);
}
