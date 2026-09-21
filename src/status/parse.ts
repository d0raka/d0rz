import type { PublicHealth, PublicSystemStatus } from "./types";
import { STALE_AFTER_MS } from "./types";

const HEALTH: ReadonlySet<string> = new Set(["healthy", "degraded", "offline", "unknown"]);

export class StatusParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StatusParseError";
  }
}

function asRecord(input: unknown): Record<string, unknown> {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new StatusParseError("status payload must be an object");
  }
  return input as Record<string, unknown>;
}

function finiteNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new StatusParseError(`${field} must be a finite number`);
  }
  return value;
}

function percent(value: unknown, field: string): number {
  const n = finiteNumber(value, field);
  if (n < 0 || n > 100) {
    throw new StatusParseError(`${field} must be between 0 and 100`);
  }
  return n;
}

function wholeCount(value: unknown, field: string): number {
  const n = finiteNumber(value, field);
  if (n < 0 || !Number.isInteger(n)) {
    throw new StatusParseError(`${field} must be a non-negative integer`);
  }
  return n;
}

function isoTimestamp(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new StatusParseError("updated_at must be an ISO-8601 string");
  }
  if (!Number.isFinite(Date.parse(value))) {
    throw new StatusParseError("updated_at must be a valid date");
  }
  return value;
}

function platformName(value: unknown): string {
  if (typeof value !== "string") {
    throw new StatusParseError("platform must be a string");
  }
  const text = value.replace(/\s+/g, " ").trim();
  if (!text || text.length > 80) {
    throw new StatusParseError("platform must be 1–80 characters");
  }
  return text;
}

export function parsePublicSystemStatus(input: unknown): PublicSystemStatus {
  const raw = asRecord(input);

  if (!HEALTH.has(String(raw.status))) {
    throw new StatusParseError("status is not a public health value");
  }

  const uptime = finiteNumber(raw.uptime_seconds, "uptime_seconds");
  if (uptime < 0) {
    throw new StatusParseError("uptime_seconds must be >= 0");
  }

  if (typeof raw.amd64_emulation !== "boolean") {
    throw new StatusParseError("amd64_emulation must be a boolean");
  }

  return {
    status: raw.status as PublicHealth,
    cpu_percent: percent(raw.cpu_percent, "cpu_percent"),
    memory_percent: percent(raw.memory_percent, "memory_percent"),
    disk_percent: percent(raw.disk_percent, "disk_percent"),
    uptime_seconds: uptime,
    agent_count: wholeCount(raw.agent_count, "agent_count"),
    service_count: wholeCount(raw.service_count, "service_count"),
    platform: platformName(raw.platform),
    amd64_emulation: raw.amd64_emulation,
    updated_at: isoTimestamp(raw.updated_at),
  };
}

export function isStale(updatedAt: string, now = Date.now(), thresholdMs = STALE_AFTER_MS): boolean {
  const stamp = Date.parse(updatedAt);
  if (!Number.isFinite(stamp)) return true;
  if (stamp > now) return false;
  return now - stamp > thresholdMs;
}
