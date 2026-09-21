import {
  formatCount,
  formatPercent,
  formatPlatform,
  formatUpdated,
  formatUptime,
  healthLabel,
} from "./status/format";
import type { MetricSample, StatusSnapshot } from "./status/source";

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function el<T extends HTMLElement>(root: ParentNode, selector: string): T {
  const node = root.querySelector(selector);
  if (!(node instanceof HTMLElement)) {
    throw new Error(`missing ${selector}`);
  }
  return node as T;
}

function setText(node: Element | null, value: string) {
  if (node) node.textContent = value;
}

function sparkPoints(values: number[], width = 72, height = 18): string {
  if (values.length < 2) return "";
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - (Math.min(100, Math.max(0, value)) / 100) * (height - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function series(history: MetricSample[], key: keyof MetricSample): number[] {
  return history.map((sample) => sample[key]);
}

export function initLiveSystem(source: {
  getSnapshot: () => StatusSnapshot;
  subscribe: (listener: (snapshot: StatusSnapshot) => void) => () => void;
}): void {
  const root = document.querySelector("[data-live]");
  if (!(root instanceof HTMLElement)) return;
  const frame = root;
  const section = frame.closest(".live") ?? frame;

  const health = el(frame, "[data-live-health]");
  const healthLabelNode = el(frame, "[data-live-health-label]");
  const cpu = el(frame, "[data-live-cpu]");
  const memory = el(frame, "[data-live-memory]");
  const disk = el(frame, "[data-live-disk]");
  const uptime = el(frame, "[data-live-uptime]");
  const agents = el(frame, "[data-live-agents]");
  const services = el(frame, "[data-live-services]");
  const platform = el(frame, "[data-live-platform]");
  const updated = el(frame, "[data-live-updated]");
  const cpuSpark = frame.querySelector("[data-spark=cpu]");
  const memorySpark = frame.querySelector("[data-spark=memory]");
  const diskSpark = frame.querySelector("[data-spark=disk]");

  const display = {
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: 0,
    agents: 0,
    services: 0,
  };
  const target = { ...display };
  let ticking = false;
  let snapshot: StatusSnapshot = source.getSnapshot();

  function paintSparks() {
    cpuSpark?.setAttribute("points", sparkPoints(series(snapshot.history, "cpu_percent")));
    memorySpark?.setAttribute("points", sparkPoints(series(snapshot.history, "memory_percent")));
    diskSpark?.setAttribute("points", sparkPoints(series(snapshot.history, "disk_percent")));
  }

  function paintStatic() {
    const data = snapshot.data;
    const loading = snapshot.kind === "loading" && !data;
    const unavailable = snapshot.kind === "unavailable" && !data;
    const stale = Boolean(data && (snapshot.stale || snapshot.kind === "unavailable"));
    const status = data?.status ?? "unknown";

    section.classList.toggle("is-loading", loading);
    section.classList.toggle("is-unavailable", unavailable || snapshot.kind === "unavailable");
    section.classList.toggle("is-stale", stale);
    section.classList.toggle("is-healthy", Boolean(data) && status === "healthy" && !stale);
    section.classList.toggle("is-degraded", Boolean(data) && status === "degraded" && !stale);
    section.classList.toggle("is-offline", Boolean(data) && (status === "offline" || unavailable));
    frame.setAttribute("aria-busy", loading ? "true" : "false");

    if (loading) {
      setText(healthLabelNode, "Loading");
      health.setAttribute("data-state", "loading");
      setText(platform, "Reading public status");
      setText(updated, "Updated —");
      return;
    }

    if (!data) {
      setText(healthLabelNode, "Unavailable");
      health.setAttribute("data-state", "unavailable");
      setText(cpu, "—");
      setText(memory, "—");
      setText(disk, "—");
      setText(uptime, "—");
      setText(agents, "—");
      setText(services, "—");
      setText(platform, "Public status is offline");
      setText(updated, "Updated —");
      return;
    }

    const label = snapshot.kind === "unavailable" ? "Unavailable" : healthLabel(data.status, stale);
    setText(healthLabelNode, label);
    health.setAttribute("data-state", stale ? "stale" : data.status);
    setText(platform, formatPlatform(data));
    setText(updated, formatUpdated(data.updated_at));
    updated.setAttribute("datetime", data.updated_at);
    paintSparks();
  }

  function paintNumbers() {
    if (!snapshot.data) return;
    setText(cpu, formatPercent(display.cpu));
    setText(memory, formatPercent(display.memory));
    setText(disk, formatPercent(display.disk));
    setText(uptime, formatUptime(display.uptime));
    setText(agents, formatCount(display.agents));
    setText(services, formatCount(display.services));
  }

  function tick() {
    ticking = false;
    if (!snapshot.data) return;
    const ease = reduceMotion() ? 1 : 0.18;
    display.cpu += (target.cpu - display.cpu) * ease;
    display.memory += (target.memory - display.memory) * ease;
    display.disk += (target.disk - display.disk) * ease;
    display.uptime += (target.uptime - display.uptime) * ease;
    display.agents += (target.agents - display.agents) * ease;
    display.services += (target.services - display.services) * ease;
    paintNumbers();
    const dist =
      Math.abs(target.cpu - display.cpu) +
      Math.abs(target.memory - display.memory) +
      Math.abs(target.disk - display.disk) +
      Math.abs(target.uptime - display.uptime) +
      Math.abs(target.agents - display.agents) +
      Math.abs(target.services - display.services);
    if (dist > 0.08) {
      ticking = true;
      requestAnimationFrame(tick);
    } else {
      display.cpu = target.cpu;
      display.memory = target.memory;
      display.disk = target.disk;
      display.uptime = target.uptime;
      display.agents = target.agents;
      display.services = target.services;
      paintNumbers();
    }
  }

  function apply(next: StatusSnapshot) {
    snapshot = next;
    paintStatic();
    if (!next.data) return;
    target.cpu = next.data.cpu_percent;
    target.memory = next.data.memory_percent;
    target.disk = next.data.disk_percent;
    target.uptime = next.data.uptime_seconds;
    target.agents = next.data.agent_count;
    target.services = next.data.service_count;
    if (reduceMotion()) {
      Object.assign(display, target);
      paintNumbers();
      return;
    }
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(tick);
    }
  }

  source.subscribe(apply);
}
