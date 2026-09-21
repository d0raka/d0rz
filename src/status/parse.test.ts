import { describe, expect, it } from "vitest";
import { isStale, parsePublicSystemStatus, StatusParseError } from "./parse";

const valid = {
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

describe("parsePublicSystemStatus", () => {
  it("accepts a public payload and drops unknown keys", () => {
    const parsed = parsePublicSystemStatus({
      ...valid,
      hostname: "secret",
      ip: "10.0.0.1",
      ssh: true,
      docker: { id: "x" },
    });

    expect(parsed).toEqual(valid);
    expect(parsed).not.toHaveProperty("hostname");
    expect(parsed.agent_count).toBe(0);
  });

  it("rejects a non-numeric agent_count", () => {
    expect(() => parsePublicSystemStatus({ ...valid, agent_count: "planned" })).toThrow(
      StatusParseError,
    );
  });

  it("rejects private-looking extra types for required fields", () => {
    expect(() => parsePublicSystemStatus({ ...valid, status: "ok" })).toThrow(StatusParseError);
    expect(() => parsePublicSystemStatus({ ...valid, cpu_percent: 180 })).toThrow(StatusParseError);
    expect(() => parsePublicSystemStatus("nope")).toThrow(StatusParseError);
  });
});

describe("isStale", () => {
  it("marks timestamps older than the threshold as stale", () => {
    const now = Date.parse("2026-09-21T01:00:00.000Z");
    expect(isStale("2026-09-21T00:50:00.000Z", now, 15 * 60 * 1000)).toBe(false);
    expect(isStale("2026-09-21T00:44:00.000Z", now, 15 * 60 * 1000)).toBe(true);
  });
});
