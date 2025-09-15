import './style.css'
import anime from "animejs/lib/anime.es.js";
import lottie from "lottie-web";
import * as FilePond from "filepond";
import "filepond/dist/filepond.min.css";
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { marked } from "marked";
import DOMPurify from "dompurify";

let loaderAnim = null;
let bootAnim = null;
const BOOT_MIN_MS = 2000;          // keep boot visible >= this many ms
let bootStart = 0;
let bootHidden = false; 

function initBootScreenLottie() {
  const boot   = document.getElementById('bootScreen');
  if (!boot) return;
  const path   = boot.dataset.bootJson;
  const target = boot.querySelector('.boot-lottie');
  if (!path || !target) return;

  try {
    bootAnim = lottie.loadAnimation({
      container: target,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path
    });
  } catch (e) {
    bootAnim = null; // spinner-less, but still gray backdrop
  }
}

function hideBootScreen() {
  if (bootHidden) return;
  bootHidden = true;

  const boot = document.getElementById('bootScreen');
  if (boot) {
    boot.setAttribute('aria-busy', 'false');
    boot.hidden = true;
    if (bootAnim) bootAnim.destroy();
  }
  // <-- reveal app content now that CSS/JS are ready
  const page = document.querySelector('.oo-page');
  if (page) page.style.visibility = 'visible';
}

/* Optional: let other modules call when heavy init finishes */
window.OO_markInitDone = function(){
  const elapsed = performance.now() - bootStart;
  const wait = Math.max(0, BOOT_MIN_MS - elapsed);
  setTimeout(hideBootScreen, wait);
};

document.addEventListener('DOMContentLoaded', () => {
  bootStart = performance.now();
  initBootScreenLottie();
});

// Hide after the page fully loads (CSS, images, 3D, etc.)
window.addEventListener('load', () => {
  const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();

  Promise.allSettled([fontsReady]).then(() => {
    const elapsed = performance.now() - bootStart;
    const wait = Math.max(0, BOOT_MIN_MS - elapsed);
    setTimeout(hideBootScreen, wait);
  });
});

// Safety timeout: never trap the user if something stalls
setTimeout(hideBootScreen, 6000);

document.addEventListener("DOMContentLoaded", () => {
  console.log("[OO] DOM ready;",
    "hasToggle:", !!document.getElementById("themeToggle"),
    "toggleAttr:", document.getElementById("themeToggle")?.dataset?.toggleJson || "(none)"
  );
});

/* =========== Boot =========== */
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggleLottie();
  initPageLoaderLottie();
  initCtaConfetti();
  initChipRipple();
  initDotsBackground();
});


/* ==== FilePond (drag-and-drop) ==== */
const fileInput = document.getElementById("filepond");
let uploadedImageDataUrl = null;

if (fileInput) {
  FilePond.create(fileInput, {
    allowMultiple: false,
    credits: false,
    onaddfile: async (err, file) => {
      if (err) return;
      const reader = new FileReader();
      reader.onload = () => { uploadedImageDataUrl = reader.result; }; // data URL
      reader.readAsDataURL(file.file);
    },
    onremovefile: () => { uploadedImageDataUrl = null; }
  });
}

/* ==== Helper chips ==== */
document.querySelectorAll(".oo-helper-chips button").forEach(btn => {
  btn.addEventListener("click", () => {
    const p = document.getElementById("prompt");
    p.value = (p.value + " " + btn.dataset.chip).trim();
  });
});



/* ==== Ask AI ==== */
const askBtn = document.getElementById("askBtn");
if (askBtn) {
  const promptEl = document.getElementById("prompt");
  const ansEl = document.getElementById("answer");

  promptEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askBtn.click(); }
  });

  askBtn.addEventListener("click", async () => {
  const prompt = promptEl.value.trim();
  const imageUrl = document.getElementById("imageUrl").value.trim();
  if (!prompt) { toast("Please enter a prompt!"); return; }

  askBtn.disabled = true; askBtn.style.opacity = 0.7;
  showLoader(true);

  const basePayload = {
    prompt,
    image_url: imageUrl || null,
    image_data_url: uploadedImageDataUrl || null
  };

  async function post(payload, forceFallback = false){
    return fetch("/api/ask/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken(),
        ...(forceFallback ? { "X-Force-Fallback": "1" } : {})
      },
      body: JSON.stringify(forceFallback ? { ...payload, force_fallback: true } : payload)
    });
  }

  try {
    // 1) normal attempt (server will auto-try fallback internally)
    let res = await post(basePayload, false);

    if (res.status === 429) {
      // 2) show cooldown + retry once forcing fallback path
      toast("Training arc cooldown — trying fallback…", "warn", 3400);
      res = await post(basePayload, true);
    }

    if (res.status === 429) {
      toast("Still cooling down — try again in a moment!", "warn", 4200);
      return;
    }

    if (!res.ok) {
      const txt = (await res.text()).slice(0, 300) || "Upstream jutsu failed. Try again!";
      toast(txt, "error");
      return;
    }

    const data = await res.json();
    if (data && data.fallback_used) {
      toast("Primary cooling down — switched to fallback.", "info", 3200);
    }

    const raw = (data && (data.answer ?? data.text)) || "";
    if (typeof marked !== "undefined" && typeof DOMPurify !== "undefined") {
      const html = DOMPurify.sanitize(marked.parse(raw, { breaks: true }));
      ansEl.innerHTML = html || "(no answer)";
    } else {
      ansEl.textContent = raw || "(no answer)";
    }

  } catch (err) {
    toast(err?.message || "Network gremlins. Check your chakra.", "error");
  } finally {
    showLoader(false);
    askBtn.disabled = false; askBtn.style.opacity = 1;
  }
});

}

/* ==== Animations ==== */
function heroEnter() {
  anime({ targets: ".oo-hero-title", translateY: [20, 0], opacity: [0, 1], easing: "easeOutExpo", duration: 900 });
  anime({ targets: ".oo-hero-visual", scale: [0.98, 1], opacity: [0, 1], easing: "easeOutExpo", duration: 1200 });
  anime({ targets: ".oo-halftone", translateX: [-8, 8], translateY: [-4, 4], direction: "alternate", easing: "easeInOutSine", duration: 2200, loop: true });
  anime({ targets: ".oo-cta", boxShadow: ["0 8px 24px rgba(255,45,85,.12)", "0 12px 30px rgba(255,45,85,.22), 0 0 16px rgba(34,211,238,.25)"], duration: 1600, easing: "easeInOutSine", direction: "alternate", loop: true });

}
document.addEventListener("DOMContentLoaded", heroEnter);

/* ==== Utils ==== */

function toast(msg, type = "info", ms = 3200){
  let host = document.getElementById("ooToasts");
  if (!host){
    host = document.createElement("div");
    host.id = "ooToasts";
    host.className = "oo-toasts";
    document.body.appendChild(host);
  }

  const el = document.createElement("div");
  el.className = `oo-toast ${type}`;
  el.textContent = msg;

  try { console.debug("[OO][toast]", type, msg); } catch {}
  host.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    setTimeout(() => el.remove(), 260);
  }, ms);
}



function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
}
const csrfToken = () => getCookie("csrftoken");

const copyBtn = document.getElementById("copyBtn");
const clearBtn = document.getElementById("clearBtn");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const text = document.getElementById("answer").textContent.trim();
    if (!text) return toast("Nothing to copy!");
    try { await navigator.clipboard.writeText(text); toast("Copied! ✂️"); }
    catch { toast("Copy failed"); }
  });
}
if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    document.getElementById("prompt").value = "";
    document.getElementById("imageUrl").value = "";
    document.getElementById("answer").textContent = "";
  });
}


function isSameOrigin(href) {
  try { return new URL(href, window.location.href).origin === window.location.origin; }
  catch { return false; }
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a) return;
  if (!isSameOrigin(a.href)) return;                 // external = ignore
  if (a.target && a.target !== "_self") return;      // new window/tab
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

  e.preventDefault();
  const go = () => { window.location.href = a.href; };

  // Native View Transitions where available
  if (document.startViewTransition) {
    document.startViewTransition(go);
  } else {
    // simple fade-out then navigate
    document.body.classList.add("page-leave");
    setTimeout(go, 120);
  }
});

function aboutEnter() {
  const cards = document.querySelectorAll(".oo-about .glass");
  const title = document.querySelector(".about-title");
  if (title) {
    anime({ targets: title, translateY: [16, 0], opacity: [0, 1], easing: "easeOutExpo", duration: 700 });
  }
  if (cards.length) {
    anime({
      targets: cards,
      translateY: [16, 0],
      opacity: [0, 1],
      easing: "easeOutExpo",
      duration: 650,
      delay: anime.stagger(120)
    });
  }
}
document.addEventListener("DOMContentLoaded", aboutEnter);


gsap.registerPlugin(ScrollTrigger);

const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Smooth scroll (Lenis) — disable if reduce motion */
let lenis = null;
if (!prefersReduce) {
  const Lenis = (await import('@studio-freight/lenis')).default; // if using dynamic import, else keep your static import
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.1 });
  function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  lenis.on('scroll', ScrollTrigger.update);
}

/* Parallax layers — only if not reduced */
function setupParallax() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const hasHero = !!document.querySelector('.hero');
  if (!reduce && hasHero) {
    if (document.querySelector('.layer-1')) {
      gsap.to('.layer-1', {
        yPercent: -12, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
    if (document.querySelector('.layer-2')) {
      gsap.to('.layer-2', {
        yPercent: -22, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }
  }

  if (!reduce) {
    const endFn = () => document.documentElement.scrollHeight - window.innerHeight;
    const pg1 = document.querySelector('.pg-1');
    const pg2 = document.querySelector('.pg-2');
    if (pg1) {
      gsap.to(pg1, { y: () => -window.innerHeight * 0.15, ease: 'none',
        scrollTrigger: { start: 0, end: endFn, scrub: true }});
    }
    if (pg2) {
      gsap.to(pg2, { y: () => -window.innerHeight * 0.28, ease: 'none',
        scrollTrigger: { start: 0, end: endFn, scrub: true }});
    }
  }
}
document.addEventListener('DOMContentLoaded', setupParallax);


function getTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}
function applyTheme(mode) {
  const isDark = mode === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  try { localStorage.setItem('oo-theme', isDark ? 'dark' : 'light'); } catch {}
}

// --- KATANA TOGGLE (0 = closed, OPEN_FRAME = open, stays on end frame) ---
function initThemeToggleLottie() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const holder   = btn.querySelector(".toggle-lottie");
  const fallback = btn.querySelector(".oo-toggle-fallback");
  const jsonUrl  = btn.dataset.toggleJson || "/static/lottie/katana_toggle.json";
  if (!holder) return;

  let wired = false;
  let isAnimating = false;
  let lastTargetFrame = 0;

  holder.style.opacity = "0"; // avoid flash

  const anim = lottie.loadAnimation({
    container: holder,
    renderer: "svg",
    loop: false,
    autoplay: false,
    path: jsonUrl
  });

  const wireOnce = () => {
    if (wired) return; wired = true;

    const total = anim.getDuration(true) || 72;
    const CLOSED_FRAME = 0;                       // sword in scabbard
    const OPEN_FRAME   = Math.round(total * 0.45); // mid frame = open

    // show frame matching current theme (light = open, dark = closed)
    const mode = getTheme();
    anim.goToAndStop(mode === 'dark' ? CLOSED_FRAME : OPEN_FRAME, true);
    holder.style.opacity = "1";
    if (fallback) fallback.style.display = "none";

    // ensure we snap to the exact end frame after any segment play
    anim.addEventListener('complete', () => {
      if (lastTargetFrame != null) anim.goToAndStop(lastTargetFrame, true);
      isAnimating = false;
    });

    btn.addEventListener("click", () => {
      if (isAnimating) return;
      isAnimating = true;

      const current = getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);

      if (next === 'light') {
        // Dark -> Light : CLOSED → OPEN (stay open)
        lastTargetFrame = OPEN_FRAME;
        anim.playSegments([CLOSED_FRAME, OPEN_FRAME], true);
      } else {
        // Light -> Dark : OPEN → CLOSED (stay closed)
        lastTargetFrame = CLOSED_FRAME;
        anim.playSegments([OPEN_FRAME, CLOSED_FRAME], true);
      }
    });
  };

  anim.addEventListener("data_ready", wireOnce);
  anim.addEventListener("DOMLoaded",  wireOnce);
  anim.addEventListener("data_failed", () => { if (fallback) fallback.style.display = "inline"; });
}


/* Three.js background — safe try/catch + reduce-motion freeze */
// === Three.js: Focus swap (Luffy -> Ace) on scroll ===
// Ensure the canvas exists before initializing (script is loaded in <head>)
async function setupThreeFocusSwap() {
  try {
    console.log('[OO][3D] init start');
  const canvas = document.getElementById("bg3d");
  if (!canvas) return; // no background canvas on this page

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scene / camera / renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(25, innerWidth / innerHeight, 0.01, 50); // very tight FOV + near plane for extreme close-up
  camera.position.set(0, 0, 2.0); // seed; will be reframed precisely
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearAlpha(0); // transparent

  // Lights
  scene.add(new THREE.HemisphereLight(0xffffff, 0x0b0e14, 1.0));
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(3, 4, 6);
  scene.add(dir);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  // Loaders / utils
  const loader = new GLTFLoader();
  const loadGLB = (url) => new Promise((res, rej) =>
    loader.load(url, g => res(g.scene), undefined, rej)
  );

  function centerAndScale(obj, targetSize = 2.0) {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    obj.position.sub(center);
    const s = targetSize / Math.max(size.x, size.y, size.z, 1e-6);
    obj.scale.setScalar(s);
  }

  function setEmphasis(root, emph /*0..1*/) {
    // scale + opacity (keep min opacity fairly high so it’s visible)
    root.scale.setScalar(THREE.MathUtils.lerp(0.9, 1.15, emph));
    root.traverse((o) => {
      if (o.isMesh) {
        const mats = Array.isArray(o.material) ? o.material : [o.material];
        mats.forEach((m) => {
          if (!m) return;
          m.transparent = true;
          m.opacity = THREE.MathUtils.lerp(0.65, 1.0, emph);
          if ("metalness" in m) m.metalness = 0.25;
          if ("roughness" in m) m.roughness = 0.35;
        });
      }
    });
  }

  // Load models (make sure these files exist)
  console.log('[OO][3D] loading GLBs...');
  let luffy = await loadGLB("/static/models/monkey_d._luffy_scenario.glb");
  let ace   = await loadGLB("/static/models/portgas_d._ace_one_piece.glb");
  console.log('[OO][3D] GLBs loaded');

  // Make them larger so they feel close on load
  centerAndScale(luffy, 5.5);
  centerAndScale(ace,   5.0);

  // Initial placement: Luffy front, Ace back (closer and more separated)
  const FRONT_Z = 0.3;   // very close to camera
  const BACK_Z  = -1.6;  // slightly behind
  const FRONT_Y = 0.0;   // keep perfectly centered vertically
  const BACK_Y  = 0.0;
  luffy.position.set(0, FRONT_Y, FRONT_Z);
  ace.position.set(0, BACK_Y,  BACK_Z);

  // Orientations around vertical axis (Y): clockwise rotations
  luffy.rotation.y = -Math.PI;          // 180 deg CW
  ace.rotation.y   = -Math.PI / 4;      // 45 deg CW

  // Align camera on world +Z (blue axis) through the viewport center and
  // place it at a fraction of the object's bounding-box depth.
  function frameOnBlueAxisBoxFraction(obj, fraction = 0.0625, fovDeg = 22, extra = 0.01) {
    obj.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    camera.fov = fovDeg; camera.updateProjectionMatrix();
    const distPart = Math.max(size.z * Math.max(fraction, 1e-6), 1e-6);
    const reduced = distPart * 2.25; // 25% closer (as tuned in viewer)
    camera.position.set(0, 0, center.z + reduced + extra);
    camera.lookAt(0, 0, center.z);
  }

  scene.add(luffy, ace);
  frameOnBlueAxisBoxFraction(luffy, 0.0625, 22, 0.01);

  // Initial emphasis
  setEmphasis(luffy, 1.0);
  setEmphasis(ace,   0.0);

  // Scroll-controlled focus f ∈ [0..1]
  const focus = { f: reduce ? 1 : 0 };
  if (!reduce && typeof gsap !== "undefined") {
    const endEl = document.getElementById("otaku");
    const endFn = endEl
      ? () => endEl.getBoundingClientRect().top + window.scrollY
      : () => document.documentElement.scrollHeight - window.innerHeight;

    gsap.to(focus, {
      f: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: endFn, scrub: true }
    });
  }

  // Resize
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  // Animate
  const clock = new THREE.Clock();
  function tick() {
    const dt = Math.min(clock.getDelta(), 0.033);
    const f  = THREE.MathUtils.clamp(focus.f, 0, 1);
    const s  = THREE.MathUtils.smoothstep(f, 0, 1);

    // Depth swap within a wider, clearer range
    luffy.position.z = THREE.MathUtils.lerp(FRONT_Z, BACK_Z, s);
    ace.position.z   = THREE.MathUtils.lerp(BACK_Z,  FRONT_Z, s);

    // Slight vertical separation
    luffy.position.y = THREE.MathUtils.lerp(FRONT_Y, BACK_Y, s);
    ace.position.y   = THREE.MathUtils.lerp(BACK_Y,  FRONT_Y, s);

    // Emphasis (scale + opacity)
    setEmphasis(luffy, 1 - s);
    setEmphasis(ace,    s);

    // Rotate only around Y (like the viewer); keep X/Z fixed
    luffy.rotation.x = 0; ace.rotation.x = 0;
    luffy.rotation.z = 0; ace.rotation.z = 0;
    // Continuous Y rotation
    luffy.rotation.y -= 0.8 * dt;
    ace.rotation.y   += 0.8 * dt;

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  } catch (e) {
    console.error('[OO][3D] init error', e);
  }
}

// Defer Three.js initialization until DOM is ready so #bg3d exists
// Call immediately (scripts are deferred by Vite), also fallback on DOM ready
setupThreeFocusSwap();
document.addEventListener('DOMContentLoaded', setupThreeFocusSwap);

(function prefillPlayground() {
  const el = document.getElementById('prompt');
  if (!el) return;
  const q = new URL(location.href).searchParams.get('q');
  if (q) el.value = q;
})();

function panelParallax() {
  if (prefersReduce) return;
  document.querySelectorAll('.glass').forEach((el, i) => {
    const fromY = i % 2 ? 18 : -18;
    gsap.fromTo(el,
      { y: fromY, opacity: 0 },
      {
        y: 0, opacity: 1, ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          end: 'bottom 55%',
          scrub: true
        }
      });
  });
}
document.addEventListener('DOMContentLoaded', panelParallax);


/* =========== Loader (dumpling) — plugs into your existing showLoader() =========== */
/** Show/Hide the overlay and play/stop the Lottie */
function showLoader(v){
  const wrap = document.getElementById('loader');
  if (!wrap) return;
  wrap.hidden = !v;
  wrap.setAttribute('aria-busy', v ? 'true' : 'false');
  if (loaderAnim) (v ? loaderAnim.play() : loaderAnim.stop());
}

function initPageLoaderLottie(){
  const wrap = document.getElementById('loader');
  if (!wrap) return;

  const jsonUrl   = wrap.dataset.loaderJson;   // from data-loader-json
  const target    = wrap.querySelector('.loader-lottie');
  const fallback  = wrap.querySelector('.loader-fallback');

  // If no Lottie JSON or target, leave CSS spinner visible.
  if (!jsonUrl || !target) return;

  try{
    loaderAnim = lottie.loadAnimation({
      container: target,
      renderer : 'svg',
      loop     : true,
      autoplay : false,
      path     : jsonUrl
    });

    // Hide the CSS spinner once the SVG is ready.
    loaderAnim.addEventListener('DOMLoaded', () => {
      if (fallback) fallback.style.display = 'none';
    });

    // If Lottie fails, keep spinner visible.
    loaderAnim.addEventListener('data_failed', () => {
      loaderAnim = null;
      if (fallback) fallback.style.display = '';
    });
  }catch(e){
    loaderAnim = null;
    if (fallback) fallback.style.display = '';
  }
}

// Ensure init runs after DOM is ready and lottie-web is loaded
document.addEventListener('DOMContentLoaded', initPageLoaderLottie);

/* =========== CTA confetti on hover =========== */
function initCtaConfetti() {
  const cta = document.querySelector(".oo-cta");
  const url = cta?.dataset.ctaJson;
  if (!cta || !url) return;
  const holder = document.createElement("span");
  holder.className = "cta-spark";
  cta.appendChild(holder);
  const anim = lottie.loadAnimation({ container: holder, renderer: "svg", loop: false, autoplay: false, path: url });
  cta.addEventListener("mouseenter", () => anim.goToAndPlay(0, true));
}

function initChipRipple() {
  const wrap = document.getElementById("genres");
  const url = wrap?.dataset.rippleJson;
  if (!wrap || !url) return;

  wrap.querySelectorAll(".chip[href]").forEach((chip) => {
    const holder = document.createElement("span");
    holder.className = "chip-ripple";
    chip.appendChild(holder);

    const anim = lottie.loadAnimation({ container: holder, renderer: "svg", loop: false, autoplay: false, path: url });

    chip.addEventListener("click", (e) => {
      const to = chip.getAttribute("href"); if (!to) return;
      if (to.startsWith("/") || to.startsWith(location.origin)) {
        e.preventDefault();
        anim.goToAndPlay(0, true);
        setTimeout(() => { window.location.href = to; }, 180);
      }
    });
  });
}



/* =========== Gradient dots background (fullscreen) =========== */
function initDotsBackground() {
  const bg = document.getElementById("bgDots");
  const jsonUrl = bg?.dataset.dotsJson;
  if (!bg || !jsonUrl) return;

  try {
    lottie.loadAnimation({
      container: bg,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: jsonUrl,
      rendererSettings: { preserveAspectRatio: "xMidYMid slice" }
    });
  } catch {}
}
