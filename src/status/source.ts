import { POLL_INTERVAL_MS, SAMPLE_HISTORY } from "./types";
import type { PublicSystemStatus } from "./types";
import { isStale, parsePublicSystemStatus, StatusParseError } from "./parse";

export type StatusKind = "loading" | "live" | "unavailable";

export type MetricSample = {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
};

export type StatusSnapshot = {
  kind: StatusKind;
  data: PublicSystemStatus | null;
  stale: boolean;
  error: string | null;
  history: MetricSample[];
};

export type StatusListener = (snapshot: StatusSnapshot) => void;

function resolveStatusUrl(): string | null {
  const remote = import.meta.env.VITE_PUBLIC_STATUS_URL?.trim();
  if (remote) return remote;
  if (import.meta.env.DEV) return "/status.mock.json";
  return null;
}

function snapshotFrom(
  kind: StatusKind,
  data: PublicSystemStatus | null,
  error: string | null,
  history: MetricSample[],
): StatusSnapshot {
  return {
    kind,
    data,
    stale: data ? isStale(data.updated_at) : false,
    error,
    history,
  };
}

export function createStatusSource(options?: {
  url?: string | null;
  intervalMs?: number;
  fetchImpl?: typeof fetch;
}) {
  const intervalMs = options?.intervalMs ?? POLL_INTERVAL_MS;
  const fetchImpl = options?.fetchImpl ?? fetch;
  let url = options?.url === undefined ? resolveStatusUrl() : options.url;

  const listeners = new Set<StatusListener>();
  let history: MetricSample[] = [];
  let last: PublicSystemStatus | null = null;
  let current: StatusSnapshot = snapshotFrom("loading", null, null, history);
  let timer: number | null = null;
  let inFlight: AbortController | null = null;
  let started = false;

  function emit(next: StatusSnapshot) {
    current = next;
    listeners.forEach((listener) => listener(current));
  }

  function remember(data: PublicSystemStatus) {
    const sample: MetricSample = {
      cpu_percent: data.cpu_percent,
      memory_percent: data.memory_percent,
      disk_percent: data.disk_percent,
    };
    history = history.length === 0
      ? [sample, sample]
      : [...history, sample].slice(-SAMPLE_HISTORY);
  }

  async function pull() {
    if (!url) {
      emit(snapshotFrom("unavailable", last, "no public status URL configured", history));
      return;
    }

    inFlight?.abort();
    const controller = new AbortController();
    inFlight = controller;

    try {
      const response = await fetchImpl(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) {
        throw new StatusParseError(`status HTTP ${response.status}`);
      }
      const parsed = parsePublicSystemStatus(await response.json());
      last = parsed;
      remember(parsed);
      emit(snapshotFrom("live", parsed, null, history));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const message = error instanceof Error ? error.message : "status unavailable";
      emit(snapshotFrom("unavailable", last, message, history));
    }
  }

  function start() {
    if (started) return;
    started = true;
    void pull();
    timer = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      void pull();
    }, intervalMs);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") void pull();
    });
  }

  function stop() {
    started = false;
    if (timer !== null) window.clearInterval(timer);
    timer = null;
    inFlight?.abort();
  }

  return {
    start,
    stop,
    pull,
    getSnapshot: () => current,
    subscribe(listener: StatusListener) {
      listeners.add(listener);
      listener(current);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export const statusSource = createStatusSource();
