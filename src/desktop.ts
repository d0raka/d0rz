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
}
