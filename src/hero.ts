export function initHero(): void {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  if (!reduce) root.classList.add("motion");

  const pointer = { x: 0.5, y: 0.42, tx: 0.5, ty: 0.42 };
  const sheen = document.querySelector("[data-sheen]");
  const typeTarget = document.querySelector("[data-type]");
  const clock = document.getElementById("clock");
  let running = false;

  function ready() {
    clockTick();
    window.setInterval(clockTick, 1000);
    if (reduce) {
      if (typeTarget) typeTarget.textContent = "build · ship · maintain";
      return;
    }
    typeLine();
    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.tx = event.clientX / Math.max(window.innerWidth, 1);
        pointer.ty = event.clientY / Math.max(window.innerHeight, 1);
      },
      { passive: true },
    );
    running = true;
    requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", () => {
      running = document.visibilityState === "visible";
      if (running) requestAnimationFrame(frame);
    });
  }

  function typeLine() {
    if (!typeTarget) return;
    const node = typeTarget;
    const full = node.textContent ?? "";
    node.textContent = "";
    let i = 0;
    function step() {
      if (i <= full.length) {
        node.textContent = full.slice(0, i);
        i += 1;
        window.setTimeout(step, 36);
      }
    }
    window.setTimeout(step, 220);
  }

  function clockTick() {
    if (!(clock instanceof HTMLTimeElement)) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    clock.dateTime = now.toISOString();
    clock.textContent = `${hh}:${mm}:${ss}`;
  }

  function gaze() {
    const el = document.querySelector(".zero");
    if (!(el instanceof HTMLElement)) return;
    const box = el.getBoundingClientRect();
    const cx = box.left + box.width * 0.5;
    const cy = box.top + box.height * 0.49;
    let nx = (pointer.x * window.innerWidth - cx) / Math.max(box.width * 0.42, 1);
    let ny = (pointer.y * window.innerHeight - cy) / Math.max(box.height * 0.42, 1);
    if (nx > 1) nx = 1;
    else if (nx < -1) nx = -1;
    if (ny > 1) ny = 1;
    else if (ny < -1) ny = -1;
    root.style.setProperty("--lx", nx.toFixed(3));
    root.style.setProperty("--ly", ny.toFixed(3));
  }

  function frame() {
    if (!running) return;
    pointer.x += (pointer.tx - pointer.x) * 0.1;
    pointer.y += (pointer.ty - pointer.y) * 0.1;
    if (sheen) {
      root.style.setProperty("--mx", `${pointer.x * 100}%`);
      root.style.setProperty("--my", `${pointer.y * 100}%`);
    }
    root.style.setProperty("--gx", `${((0.5 - pointer.x) * 36).toFixed(2)}px`);
    root.style.setProperty("--gy", `${((0.5 - pointer.y) * 28).toFixed(2)}px`);
    gaze();
    requestAnimationFrame(frame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready);
  } else {
    ready();
  }
}
