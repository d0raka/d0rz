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
  const cvApp = document.querySelector<HTMLButtonElement>("[data-open-cv]");
  const cvHandle = dialog?.querySelector<HTMLElement>("[data-cv-drag-handle]");
  const syncCvDock = () => {
    const isOpen = Boolean(dialog?.open);
    cvApp?.classList.toggle("is-running", isOpen);
    cvApp?.setAttribute("aria-label", isOpen ? "Minimize CV" : "Open CV");
  };
  const closeCv = (reset: boolean) => {
    if (!dialog) return;
    dialog.close();
    if (reset) {
      dialog.classList.remove("is-maximized");
      dialog.style.transform = "";
      dialog.dataset.offsetX = "0";
      dialog.dataset.offsetY = "0";
    }
    syncCvDock();
  };
  cvApp?.addEventListener("click", () => {
    if (!dialog) return;
    if (dialog.open) closeCv(false);
    else dialog.show();
    syncCvDock();
  });
  for (const button of dialog?.querySelectorAll<HTMLButtonElement>("[data-cv-action]") ?? []) {
    button.addEventListener("click", () => {
      const action = button.dataset.cvAction;
      if (action === "close") closeCv(true);
      if (action === "minimize") closeCv(false);
      if (action === "maximize" && dialog) {
        dialog.classList.toggle("is-maximized");
        dialog.style.transform = dialog.classList.contains("is-maximized") ? "" : `translate(${dialog.dataset.offsetX ?? 0}px, ${dialog.dataset.offsetY ?? 0}px)`;
      }
    });
  }
  dialog?.addEventListener("close", syncCvDock);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog?.open) closeCv(true);
  });
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeCv(true);
  });
  if (dialog && cvHandle) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    cvHandle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || dialog.classList.contains("is-maximized") || (event.target as Element).closest("button, a")) return;
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      originX = Number(dialog.dataset.offsetX ?? 0);
      originY = Number(dialog.dataset.offsetY ?? 0);
      cvHandle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    cvHandle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const left = (window.innerWidth - dialog.offsetWidth) / 2;
      const top = (window.innerHeight - dialog.offsetHeight) / 2;
      const x = Math.max(16 - left, Math.min(window.innerWidth - dialog.offsetWidth - 16 - left, originX + event.clientX - startX));
      const y = Math.max(50 - top, Math.min(window.innerHeight - dialog.offsetHeight - 100 - top, originY + event.clientY - startY));
      dialog.dataset.offsetX = String(x);
      dialog.dataset.offsetY = String(y);
      dialog.style.transform = `translate(${x}px, ${y}px)`;
    });
    const stopDragging = () => { dragging = false; };
    cvHandle.addEventListener("pointerup", stopDragging);
    cvHandle.addEventListener("pointercancel", stopDragging);
  }

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
    const aboutOpen = Boolean(aboutWindow?.classList.contains("is-open"));
    const projectsOpen = projectWindows.some((item) => item.classList.contains("is-open"));
    aboutApp?.classList.toggle("is-running", aboutOpen);
    aboutApp?.setAttribute("aria-label", aboutOpen ? "Minimize About" : "Open About");
    projectsApp?.classList.toggle("is-running", projectsOpen);
    projectsApp?.setAttribute("aria-label", projectsOpen ? "Minimize all projects" : "Open all projects");
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
    if (aboutWindow) {
      if (aboutWindow.classList.contains("is-open")) closeWindow(aboutWindow, false);
      else {
        openWindow(aboutWindow);
        if (!desktopWindowMode.matches) aboutWindow.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });
  document.querySelector<HTMLButtonElement>("[data-open-projects]")?.addEventListener("click", () => {
    projectsTouched = true;
    if (projectWindows.some((item) => item.classList.contains("is-open"))) projectWindows.forEach((item) => closeWindow(item, false));
    else {
      projectWindows.forEach(openWindow);
      if (!desktopWindowMode.matches) projectWindows[0]?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  window.setTimeout(() => {
    if (!aboutTouched && aboutWindow) openWindow(aboutWindow);
  }, 3000);
  window.setTimeout(() => {
    if (!projectsTouched) projectWindows.forEach(openWindow);
  }, 3800);

  for (const item of appWindows) {
    item.addEventListener("pointerdown", () => {
      if (desktopWindowMode.matches && item.classList.contains("is-open")) item.style.zIndex = String(++topLayer);
    });
    for (const button of item.querySelectorAll<HTMLButtonElement>("[data-window-action]")) {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
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
    let baseLeft = 0;
    let baseTop = 0;
    let windowWidth = 0;
    let windowHeight = 0;
    let dragging = false;
    handle.addEventListener("pointerdown", (event) => {
      if (!desktopWindowMode.matches || event.button !== 0 || item.classList.contains("is-maximized") || (event.target as Element).closest("button")) return;
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      originX = Number(item.dataset.offsetX ?? 0);
      originY = Number(item.dataset.offsetY ?? 0);
      item.classList.add("is-dragging");
      const rect = item.getBoundingClientRect();
      baseLeft = rect.left - originX;
      baseTop = rect.top - originY;
      windowWidth = rect.width;
      windowHeight = rect.height;
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    handle.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const x = Math.max(16 - baseLeft, Math.min(window.innerWidth - windowWidth - 16 - baseLeft, originX + event.clientX - startX));
      const y = Math.max(50 - baseTop, Math.min(window.innerHeight - windowHeight - 16 - baseTop, originY + event.clientY - startY));
      item.dataset.offsetX = String(x);
      item.dataset.offsetY = String(y);
      item.style.transform = `translate(${x}px, ${y}px)`;
    });
    const stopDragging = () => { dragging = false; item.classList.remove("is-dragging"); };
    handle.addEventListener("pointerup", stopDragging);
    handle.addEventListener("pointercancel", stopDragging);
  }
}
