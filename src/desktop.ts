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
  const selectScene = (name: string) => {
    for (const button of sceneButtons) button.setAttribute("aria-pressed", String(button.dataset.sceneButton === name));
    for (const item of sceneItems) {
      if (item.dataset.sceneItem === name) item.setAttribute("data-active", "");
      else item.removeAttribute("data-active");
    }
  };
  for (const button of sceneButtons) button.addEventListener("click", () => selectScene(button.dataset.sceneButton ?? "about"));
  document.querySelector<HTMLAnchorElement>("[data-open-about]")?.addEventListener("click", (event) => {
    event.preventDefault();
    selectScene("about");
    if (window.matchMedia("(max-width: 1250px), (max-height: 740px)").matches) {
      sceneButtons.find((button) => button.dataset.sceneButton === "about")?.focus();
    }
  });
}
