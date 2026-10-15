import { formatPercent, formatPlatform, formatUpdated, formatUptime, healthLabel } from "./status/format";
import type { StatusSnapshot } from "./status/source";

export function initDesktop(source: {
  subscribe: (listener: (snapshot: StatusSnapshot) => void) => () => void;
}): void {
  const health = document.querySelector<HTMLElement>("[data-menu-health]");
  const label = document.querySelector<HTMLElement>("[data-menu-health-label]");
  const cpu = document.querySelector<HTMLElement>("[data-menu-cpu]");
  const memory = document.querySelector<HTMLElement>("[data-menu-memory]");
  const disk = document.querySelector<HTMLElement>("[data-menu-disk]");
  const uptime = document.querySelector<HTMLElement>("[data-menu-uptime]");
  const platform = document.querySelector<HTMLElement>("[data-menu-platform]");
  const updated = document.querySelector<HTMLTimeElement>("[data-menu-updated]");

  source.subscribe((snapshot) => {
    if (!health || !label || !cpu || !memory || !disk || !uptime || !platform || !updated) return;
    const data = snapshot.data;
    const stale = Boolean(data && (snapshot.stale || snapshot.kind === "unavailable"));
    const state = !data ? snapshot.kind : stale ? "stale" : data.status;
    health.dataset.state = state;
    label.textContent = !data
      ? snapshot.kind === "loading" ? "Connecting" : "Unavailable"
      : snapshot.kind === "unavailable" ? "Unavailable" : data.status === "healthy" && !stale ? "Running" : healthLabel(data.status, stale);
    cpu.textContent = data ? formatPercent(data.cpu_percent) : "—";
    memory.textContent = data ? formatPercent(data.memory_percent) : "—";
    disk.textContent = data ? formatPercent(data.disk_percent) : "—";
    uptime.textContent = data ? formatUptime(data.uptime_seconds) : "—";
    platform.textContent = data ? formatPlatform(data) : "Platform —";
    updated.textContent = data ? formatUpdated(data.updated_at) : "Updated —";
    updated.dateTime = data?.updated_at ?? "";
  });

  const dialog = document.querySelector<HTMLDialogElement>("#cv-dialog");
  const open = document.querySelector<HTMLButtonElement>("[data-open-cv]");
  const close = document.querySelector<HTMLButtonElement>("[data-close-cv]");
  open?.addEventListener("click", () => dialog?.showModal());
  close?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  const cvTabs = [...document.querySelectorAll<HTMLButtonElement>("[data-cv-tab]")];
  const cvPages = [...document.querySelectorAll<HTMLElement>("[data-cv-page]")];
  const selectCvPage = (name: string) => {
    for (const tab of cvTabs) {
      const selected = tab.dataset.cvTab === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const page of cvPages) page.hidden = page.dataset.cvPage !== name;
  };
  for (const [index, tab] of cvTabs.entries()) {
    tab.addEventListener("click", () => selectCvPage(tab.dataset.cvTab ?? "profile"));
    tab.addEventListener("keydown", (event) => {
      const next = event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1 : event.key === "Home" ? 0 : event.key === "End" ? cvTabs.length - 1 : -1;
      if (next < 0 && event.key !== "ArrowLeft") return;
      if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const nextTab = cvTabs[(next + cvTabs.length) % cvTabs.length];
      selectCvPage(nextTab.dataset.cvTab ?? "profile");
      nextTab.focus();
    });
  }

  const sceneButtons = [...document.querySelectorAll<HTMLButtonElement>("[data-scene-button]")];
  const sceneItems = [...document.querySelectorAll<HTMLElement>("[data-scene-item]")];
  const aboutSections = [...document.querySelectorAll<HTMLElement>("[data-about-section]")];
  const selectScene = (name: string) => {
    for (const button of sceneButtons) button.setAttribute("aria-pressed", String(button.dataset.sceneButton === name));
    const isAboutSection = ["about", "work", "contact"].includes(name);
    for (const item of sceneItems) {
      if (item.dataset.sceneItem === (isAboutSection ? "about" : name)) item.setAttribute("data-active", "");
      else item.removeAttribute("data-active");
    }
    for (const section of aboutSections) {
      if (section.dataset.aboutSection === name) section.setAttribute("data-section-active", "");
      else section.removeAttribute("data-section-active");
    }
  };
  for (const button of sceneButtons) button.addEventListener("click", () => selectScene(button.dataset.sceneButton ?? "about"));
  const desktopWindowMode = window.matchMedia("(min-width: 1251px) and (min-height: 741px)");
  const appWindows = [...document.querySelectorAll<HTMLElement>("[data-window]")];
  const aboutWindow = appWindows.find((item) => item.dataset.window === "about");
  const projectWindows = appWindows.filter((item) => item.dataset.window !== "about");
  const aboutApp = document.querySelector<HTMLElement>("[data-open-about]");
  const projectsApp = document.querySelector<HTMLElement>("[data-open-projects]");
  let aboutTouched = false;
  let projectsTouched = false;
  let topLayer = 10;
  const updateDock = () => {
    aboutApp?.classList.toggle("is-running", Boolean(aboutWindow?.classList.contains("is-open")));
    projectsApp?.classList.toggle("is-running", projectWindows.some((item) => item.classList.contains("is-open")));
  };
  const openWindow = (item: HTMLElement) => {
    item.classList.add("is-open");
    item.style.zIndex = String(++topLayer);
    updateDock();
  };
  const closeWindow = (item: HTMLElement, reset: boolean) => {
    item.classList.remove("is-open");
    if (reset) {
      item.classList.remove("is-maximized");
      item.style.transform = "";
      item.dataset.offsetX = "0";
      item.dataset.offsetY = "0";
    }
    updateDock();
  };
  document.querySelector<HTMLAnchorElement>("[data-open-about]")?.addEventListener("click", (event) => {
    event.preventDefault();
    aboutTouched = true;
    selectScene("about");
    if (desktopWindowMode.matches && aboutWindow) openWindow(aboutWindow);
    else {
      sceneButtons.find((button) => button.dataset.sceneButton === "about")?.focus();
    }
  });
  document.querySelector<HTMLButtonElement>("[data-open-projects]")?.addEventListener("click", () => {
    projectsTouched = true;
    if (desktopWindowMode.matches) projectWindows.forEach(openWindow);
    else selectScene("tennis");
  });

  window.setTimeout(() => {
    if (desktopWindowMode.matches && !aboutTouched && aboutWindow) openWindow(aboutWindow);
  }, 3000);
  window.setTimeout(() => {
    if (desktopWindowMode.matches && !projectsTouched) projectWindows.forEach(openWindow);
  }, 3800);

  for (const item of appWindows) {
    item.addEventListener("pointerdown", () => {
      if (desktopWindowMode.matches && item.classList.contains("is-open")) item.style.zIndex = String(++topLayer);
    });
    for (const button of item.querySelectorAll<HTMLButtonElement>("[data-window-action]")) {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!desktopWindowMode.matches) return;
        if (item === aboutWindow) aboutTouched = true;
        else projectsTouched = true;
        const action = button.dataset.windowAction;
        if (action === "close") closeWindow(item, true);
        if (action === "minimize") closeWindow(item, false);
        if (action === "maximize") {
          item.classList.toggle("is-maximized");
          item.style.transform = item.classList.contains("is-maximized") ? "" : `translate(${item.dataset.offsetX ?? 0}px, ${item.dataset.offsetY ?? 0}px)`;
          item.style.zIndex = String(++topLayer);
        }
      });
    }
    const handle = item.querySelector<HTMLElement>("[data-drag-handle]");
    if (!handle) continue;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let dragging = false;
    handle.addEventListener("pointerdown", (event) => {
      if (!desktopWindowMode.matches || event.button !== 0 || item.classList.contains("is-maximized") || (event.target as Element).closest("button")) return;
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      originX = Number(item.dataset.offsetX ?? 0);
      originY = Number(item.dataset.offsetY ?? 0);
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    handle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const rect = item.getBoundingClientRect();
      const baseLeft = rect.left - Number(item.dataset.offsetX ?? 0);
      const baseTop = rect.top - Number(item.dataset.offsetY ?? 0);
      const x = Math.max(120 - rect.width - baseLeft, Math.min(window.innerWidth - 120 - baseLeft, originX + event.clientX - startX));
      const y = Math.max(50 - baseTop, Math.min(window.innerHeight - 100 - baseTop, originY + event.clientY - startY));
      item.dataset.offsetX = String(x);
      item.dataset.offsetY = String(y);
      item.style.transform = `translate(${x}px, ${y}px)`;
    });
    handle.addEventListener("pointerup", () => { dragging = false; });
    handle.addEventListener("pointercancel", () => { dragging = false; });
  }
}
