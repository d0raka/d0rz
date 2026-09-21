import type { PublicHealth, PublicSystemStatus } from "./types";

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatCount(value: number): string {
  return String(Math.trunc(value));
}

export function formatUptime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${total}s`;
}

export function formatUpdated(iso: string, now = Date.now()): string {
  const stamp = Date.parse(iso);
  if (!Number.isFinite(stamp)) return "Updated —";
  const delta = Math.max(0, now - stamp);
  const minutes = Math.round(delta / 60000);
  if (minutes < 1) return "Updated just now";
  if (minutes === 1) return "Updated 1 min ago";
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return "Updated 1 hour ago";
  if (hours < 48) return `Updated ${hours} hours ago`;
  const days = Math.round(hours / 24);
  return `Updated ${days}d ago`;
}

export function formatPlatform(data: PublicSystemStatus): string {
  const parts = data.platform.split(/[·,|]/).map((part) => part.trim()).filter(Boolean);
  if (data.amd64_emulation && !parts.some((part) => /x86_64|amd64/i.test(part))) {
    parts.push("x86_64 compatibility");
  }
  return parts.join(" · ");
}

export function healthLabel(status: PublicHealth, stale: boolean): string {
  if (stale) return "Stale";
  if (status === "healthy") return "Healthy";
  if (status === "degraded") return "Degraded";
  if (status === "offline") return "Offline";
  return "Unknown";
}
