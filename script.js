const root = document.documentElement;
const body = document.body;
const hero = document.querySelector(".hero");
const canvas = document.getElementById("noiseCanvas");
const context = canvas.getContext("2d", { alpha: true });
const bufferCanvas = document.createElement("canvas");
const bufferContext = bufferCanvas.getContext("2d", { alpha: true });

let width = 0;
let height = 0;
let dpr = 1;
let pointerX = 0;
let pointerY = 0;
let easedX = 0;
let easedY = 0;
let frame = 0;

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawNoise() {
  const imageWidth = Math.ceil(width / 3);
  const imageHeight = Math.ceil(height / 3);
  bufferCanvas.width = imageWidth;
  bufferCanvas.height = imageHeight;
  const imageData = bufferContext.createImageData(imageWidth, imageHeight);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const value = Math.random() * 255;
    const alpha = Math.random() > 0.52 ? 38 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
    data[i + 3] = alpha;
  }

  context.clearRect(0, 0, width, height);
  bufferContext.putImageData(imageData, 0, 0);

  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(bufferCanvas, 0, 0, imageWidth, imageHeight, 0, 0, width, height);
  context.restore();

  const tearCount = frame % 17 === 0 ? 8 : 3;
  context.save();
  context.globalCompositeOperation = "screen";
  for (let i = 0; i < tearCount; i += 1) {
    const y = Math.random() * height;
    const lineHeight = 1 + Math.random() * 8;
    const offset = (Math.random() - 0.5) * 80;
    context.globalAlpha = 0.05 + Math.random() * 0.18;
    context.fillStyle = "#ffffff";
    context.fillRect(offset, y, width * (0.28 + Math.random() * 0.8), lineHeight);
  }
  context.restore();
}

function updatePointer(event) {
  const x = "clientX" in event ? event.clientX : width / 2;
  const y = "clientY" in event ? event.clientY : height / 2;
  pointerX = x - width / 2;
  pointerY = y - height / 2;
}

function animate() {
  frame += 1;
  easedX += (pointerX - easedX) * 0.08;
  easedY += (pointerY - easedY) * 0.08;

  root.style.setProperty("--mx", `${easedX.toFixed(2)}px`);
  root.style.setProperty("--my", `${easedY.toFixed(2)}px`);
  root.style.setProperty("--scan", `${(frame % 28) - 14}px`);

  if (frame % 2 === 0) {
    drawNoise();
  }

  requestAnimationFrame(animate);
}

function boot() {
  resizeCanvas();
  pointerX = 0;
  pointerY = 0;
  drawNoise();
  animate();
  runIntroSequence();
  initScrollReveal();
}

function runIntroSequence() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    body.classList.remove("intro-sequence");
    return;
  }

  const steps = [
    [220, "intro-title-in"],
    [980, "intro-atmosphere"],
    [1380, "intro-kinetic"],
    [2240, "intro-ui"],
  ];

  steps.forEach(([delay, className]) => {
    window.setTimeout(() => body.classList.add(className), delay);
  });

  window.setTimeout(() => {
    body.classList.add("intro-finished");
    body.classList.remove(
      "intro-sequence",
      "intro-title-in",
      "intro-atmosphere",
      "intro-kinetic",
      "intro-ui",
    );
  }, 3850);
}

function initScrollReveal() {
  const sections = document.querySelectorAll(".reveal-section");

  if (!sections.length) {
    return;
  }

  if (!("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -12% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("pointermove", updatePointer);
window.addEventListener("pointerleave", () => {
  pointerX = 0;
  pointerY = 0;
});

hero.addEventListener("click", () => {
  hero.classList.remove("is-pulsing");
  window.requestAnimationFrame(() => hero.classList.add("is-pulsing"));
});

boot();
