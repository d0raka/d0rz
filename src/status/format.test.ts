import { describe, expect, it } from "vitest";
import { formatCount, formatPlatform, formatUptime, healthLabel } from "./format";
import type { PublicSystemStatus } from "./types";

const base: PublicSystemStatus = {
  status: "healthy",
  cpu_percent: 18,
  memory_percent: 31,
  disk_percent: 5,
  uptime_seconds: 15120,
  agent_count: 0,
  service_count: 6,
  platform: "Ubuntu · ARM64",
  amd64_emulation: true,
  updated_at: "2026-09-21T00:30:00.000Z",
};

describe("formatters", () => {
  it("keeps agent counts numeric", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(12)).toBe("12");
  });

  it("formats uptime in compact units", () => {
    expect(formatUptime(15120)).toBe("4h 12m");
    expect(formatUptime(90)).toBe("1m");
  });

  it("appends x86_64 compatibility when emulation is on", () => {
    expect(formatPlatform(base)).toBe("Ubuntu · ARM64 · x86_64 compatibility");
  });

  it("labels stale snapshots as Stale", () => {
    expect(healthLabel("healthy", true)).toBe("Stale");
    expect(healthLabel("healthy", false)).toBe("Healthy");
  });
});
