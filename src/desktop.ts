import { formatPercent, healthLabel } from "./status/format";
import type { StatusSnapshot } from "./status/source";

export function initDesktop(source: {
  subscribe: (listener: (snapshot: StatusSnapshot) => void) => () => void;
}): void {
  const health = document.querySelector<HTMLElement>("[data-menu-health]");
  const label = document.querySelector<HTMLElement>("[data-menu-health-label]");
  const cpu = document.querySelector<HTMLElement>("[data-menu-cpu]");
  const memory = document.querySelector<HTMLElement>("[data-menu-memory]");

  source.subscribe((snapshot) => {
    if (!health || !label || !cpu || !memory) return;
    const data = snapshot.data;
    const stale = Boolean(data && (snapshot.stale || snapshot.kind === "unavailable"));
    const state = !data ? snapshot.kind : stale ? "stale" : data.status;
    health.dataset.state = state;
    label.textContent = !data
      ? snapshot.kind === "loading" ? "Connecting" : "Unavailable"
      : snapshot.kind === "unavailable" ? "Unavailable" : healthLabel(data.status, stale);
    cpu.textContent = data ? formatPercent(data.cpu_percent) : "—";
    memory.textContent = data ? formatPercent(data.memory_percent) : "—";
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
