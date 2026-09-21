export const PUBLIC_STATUS_FIELDS = [
  "status",
  "cpu_percent",
  "memory_percent",
  "disk_percent",
  "uptime_seconds",
  "agent_count",
  "service_count",
  "platform",
  "amd64_emulation",
  "updated_at",
] as const;

export type PublicStatusField = (typeof PUBLIC_STATUS_FIELDS)[number];

export type PublicHealth = "healthy" | "degraded" | "offline" | "unknown";

export type PublicSystemStatus = {
  status: PublicHealth;
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  uptime_seconds: number;
  agent_count: number;
  service_count: number;
  platform: string;
  amd64_emulation: boolean;
  updated_at: string;
};

export const STALE_AFTER_MS = 15 * 60 * 1000;
export const POLL_INTERVAL_MS = 60 * 1000;
export const SAMPLE_HISTORY = 20;
