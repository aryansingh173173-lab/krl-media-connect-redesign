"use strict";

// The motion layer is progressive enhancement: the complete story remains
// readable when JavaScript or animation is unavailable.
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const motionRoot = document.documentElement;
let motionOn = !motionQuery.matches;
let motionFrame = 0;
let lastScrollY = window.scrollY;

try {
  const savedMotion = localStorage.getItem("krl-motion");
  if (savedMotion !== null) motionOn = savedMotion === "on";
} catch {}

function setMotion(enabled, persist = true) {
  motionOn = Boolean(enabled) && !motionQuery.matches;
  motionRoot.classList.toggle("motion-on", motionOn);
  motionRoot.classList.toggle("motion-off", !motionOn);
  document.querySelectorAll("video").forEach((video) => {
    if (!motionOn && !video.paused) video.pause();
  });
  document.dispatchEvent(
    new CustomEvent("motionchange", { detail: { enabled: motionOn } }),
  );
  if (persist) {
    try {
      localStorage.setItem("krl-motion", motionOn ? "on" : "off");
    } catch {}
  }
}

motionRoot.classList.add("motion-ready");
setMotion(motionOn, false);
motionQuery.addEventListener("change", (event) => setMotion(!event.matches, false));

const revealSelector = [
  ".section-label",
  ".display",
  ".intro-grid > div",
  ".opening-main",
  ".opening-side",
  ".programme",
  ".launch-name",
  ".launch-bottom p",
  ".launch-story .narrative > p",
  ".league-number",
  ".launch-quote",
  ".acceptance-portrait",
  ".acceptance-layout .narrative > p",
  ".acceptance-body",
  ".acceptance-quote blockquote",
  ".puja-layout figure",
  ".puja-layout .narrative > p",
  ".next-doors article",
  ".person",
  ".recognition > *",
  ".hosts > *",
  ".film-heading > div",
  ".feature-video",
  ".film-caption > *",
  ".gallery-toolbar",
  ".gallery-item",
  ".press-feature > *",
  ".press-links > *",
  ".closing > div > *",
].join(",");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      revealObserver.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -8%", threshold: 0.08 },
);

function registerReveals(root = document) {
  const elements = [
    ...(root.matches?.(revealSelector) ? [root] : []),
    ...root.querySelectorAll(revealSelector),
  ];
  elements.forEach((element, index) => {
    if (element.dataset.revealReady) return;
    element.dataset.revealReady = "true";
    element.style.setProperty("--reveal-delay", `${(index % 3) * 85}ms`);
    revealObserver.observe(element);
  });
}

const programme = document.querySelector(".programme");
if (programme) {
  const summary = programme.querySelector("summary");
  let openTimer = 0;
  const programmeObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || programme.dataset.userControlled) return;
        programme.classList.add("is-awakening");
        openTimer = window.setTimeout(
          () => {
            if (programme.dataset.userControlled) return;
            programme.open = true;
            programme.classList.add("is-scroll-opened");
            observer.unobserve(programme);
          },
          motionOn ? 180 : 0,
        );
      });
    },
    { rootMargin: "0px 0px -12%", threshold: 0.22 },
  );

  summary?.addEventListener("click", () => {
    programme.dataset.userControlled = "true";
    window.clearTimeout(openTimer);
    programmeObserver.unobserve(programme);
  });
  programme.addEventListener("toggle", () => {
    programme.classList.toggle("is-expanded", programme.open);
  });
  programmeObserver.observe(programme);
}

function animateCharacters() {
  const title = document.querySelector(".protyabartan-reveal");
  if (!title) return;
  const text = title.textContent.trim();
  title.setAttribute("aria-label", text);
  title.replaceChildren(
    ...Array.from(text).map((character, index) => {
      const span = document.createElement("span");
      span.className = "hero-char";
      span.textContent = character;
      span.setAttribute("aria-hidden", "true");
      span.style.setProperty("--char-index", index);
      return span;
    }),
  );
}

const orbit = document.querySelector(".cursor-orbit");
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let orbitX = pointerX;
let orbitY = pointerY;

function animateOrbit() {
  orbitX += (pointerX - orbitX) * 0.16;
  orbitY += (pointerY - orbitY) * 0.16;
  orbit.style.transform = `translate3d(${orbitX}px, ${orbitY}px, 0) translate(-50%, -50%)`;
  requestAnimationFrame(animateOrbit);
}

if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    document.body.style.setProperty("--pointer-x", `${event.clientX}px`);
    document.body.style.setProperty("--pointer-y", `${event.clientY}px`);
  });
  document.addEventListener("pointerover", (event) => {
    orbit.classList.toggle(
      "is-active",
      Boolean(event.target.closest("a, button, .person, .gallery-item")),
    );
    orbit.classList.toggle(
      "is-view",
      Boolean(event.target.closest(".image-open, .gallery-item")),
    );
  });
  animateOrbit();
}

function attachTilt(card) {
  if (card.dataset.tiltReady) return;
  card.dataset.tiltReady = "true";
  card.addEventListener("pointermove", (event) => {
    if (!motionOn) return;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    card.style.setProperty("--tilt-x", `${x * 2.2}deg`);
    card.style.setProperty("--tilt-y", `${y * -2.2}deg`);
    card.style.setProperty("--shine-x", `${(x + 0.5) * 100}%`);
    card.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
  });
  card.addEventListener("pointerleave", () => {
    card.style.removeProperty("--tilt-x");
    card.style.removeProperty("--tilt-y");
  });
}

function attachMagnet(element) {
  if (element.dataset.magnetReady) return;
  element.dataset.magnetReady = "true";
  element.addEventListener("pointermove", (event) => {
    if (!motionOn) return;
    const box = element.getBoundingClientRect();
    element.style.setProperty(
      "--magnet-x",
      `${(event.clientX - box.left - box.width / 2) * 0.13}px`,
    );
    element.style.setProperty(
      "--magnet-y",
      `${(event.clientY - box.top - box.height / 2) * 0.13}px`,
    );
  });
  element.addEventListener("pointerleave", () => {
    element.style.removeProperty("--magnet-x");
    element.style.removeProperty("--magnet-y");
  });
}

function registerInteractive(root = document) {
  const tiltTargets = [
    ...(root.matches?.(".person, .gallery-item") ? [root] : []),
    ...root.querySelectorAll(".person, .gallery-item"),
  ];
  const magnetTargets = [
    ...(root.matches?.(".circle-arrow, .outline-button") ? [root] : []),
    ...root.querySelectorAll(".circle-arrow, .outline-button"),
  ];
  tiltTargets.forEach(attachTilt);
  magnetTargets.forEach(attachMagnet);
}

const dynamicObserver = new MutationObserver((records) => {
  for (const record of records) {
    for (const node of record.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;
      registerReveals(node);
      registerInteractive(node);
    }
  }
});
dynamicObserver.observe(document.querySelector("#gallery-grid"), {
  childList: true,
});

const launch = document.querySelector(".launch-section");
launch.addEventListener("pointermove", (event) => {
  const box = launch.getBoundingClientRect();
  launch.style.setProperty("--launch-x", `${event.clientX - box.left}px`);
  launch.style.setProperty("--launch-y", `${event.clientY - box.top}px`);
});

const poster = document.querySelector(".poster-display");
document.querySelector(".hero").addEventListener("pointermove", (event) => {
  if (!motionOn || window.innerWidth < 760) return;
  const x = event.clientX / window.innerWidth - 0.5;
  const y = event.clientY / window.innerHeight - 0.5;
  poster.style.setProperty("--poster-rx", `${y * -1.2}deg`);
  poster.style.setProperty("--poster-ry", `${x * 1.8}deg`);
  poster.style.setProperty("--poster-x", `${x * 4}px`);
  poster.style.setProperty("--poster-y", `${y * 3}px`);
});
document.querySelector(".hero").addEventListener("pointerleave", () => {
  ["--poster-rx", "--poster-ry", "--poster-x", "--poster-y"].forEach(
    (property) => poster.style.removeProperty(property),
  );
});

const sections = ["top", "day", "launch", "acceptance", "guests", "film", "puja", "gallery", "media"];
document.querySelector(".chapter-rail-total").textContent = String(sections.length - 1).padStart(2, "0");
function updateMotionScroll() {
  const scrollY = window.scrollY;
  const viewport = window.innerHeight;
  const hero = document.querySelector(".hero");
  const heroProgress = Math.min(1, scrollY / Math.max(1, hero.offsetHeight));
  motionRoot.style.setProperty("--hero-progress", heroProgress);
  motionRoot.style.setProperty("--scroll-shift", `${scrollY * -0.06}px`);
  motionRoot.style.setProperty(
    "--scroll-direction",
    scrollY > lastScrollY ? "1" : "-1",
  );
  lastScrollY = scrollY;
  let current = 0;
  sections.forEach((id, index) => {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top < viewport * 0.55)
      current = index;
  });
  document.querySelector(".chapter-rail-number").textContent = String(
    current,
  ).padStart(2, "0");
  document.querySelector(".chapter-rail i").style.transform =
    `scaleY(${current / (sections.length - 1)})`;
  motionFrame = 0;
}

window.addEventListener(
  "scroll",
  () => {
    if (!motionFrame) motionFrame = requestAnimationFrame(updateMotionScroll);
  },
  { passive: true },
);

const originalLanguageApply = window.applyLanguage;
if (typeof originalLanguageApply === "function") {
  window.applyLanguage = function enhancedLanguageApply(lang) {
    originalLanguageApply(lang);
    animateCharacters();
  };
  document.querySelectorAll(".lang button").forEach((button) => {
    button.addEventListener("click", () => requestAnimationFrame(animateCharacters));
  });
}

registerReveals();
registerInteractive();
animateCharacters();
const wordmarkObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("wordmark-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.25 });
wordmarkObserver.observe(document.querySelector(".puja-wordmark"));
updateMotionScroll();

const finishIntro = () =>
  window.setTimeout(() => document.body.classList.add("intro-complete"), 500);
if (document.readyState === "complete") finishIntro();
else window.addEventListener("load", finishIntro, { once: true });
