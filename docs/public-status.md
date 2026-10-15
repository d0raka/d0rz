# Public system status

The menu bar on the public site reads one JSON document. It never talks to the private control plane. It displays running state, CPU, memory, disk, uptime, platform, and update time from `PublicSystemStatus`. Agent and service counts remain in the feed schema but are not displayed.

## Schema

```ts
type PublicSystemStatus = {
  status: "healthy" | "degraded" | "offline" | "unknown";
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
```

Rules the frontend enforces:

- Extra keys are ignored (hostnames, IPs, Docker, paths, tokens).
- `agent_count` must be a non-negative integer, even though the menu does not display it.
- Percents are 0-100. `updated_at` must be ISO-8601.

Parser: `src/status/parse.ts`. Types: `src/status/types.ts`.

## `VITE_PUBLIC_STATUS_URL`

The default public URL is:

https://raw.githubusercontent.com/d0raka/d0rz-status/main/status.json

That file is public GitHub raw JSON from [d0raka/d0rz-status](https://github.com/d0raka/d0rz-status). It is not a secret. Copy `.env.example` to `.env` only when you need a different URL. Do not commit that file.

| Mode | URL unset | URL set |
| --- | --- | --- |
| `npm run dev` | `/status.mock.json` | fetch that URL every 60s |
| `npm run dev:live` | public d0rz-status JSON | fetch that URL every 60s |
| `npm run build` / production | public d0rz-status JSON | fetch that URL every 60s |

## Mock development mode

File: `public/status.mock.json`

Values are realistic and development-only (healthy workstation, `agent_count: 0`, seven services). Do not copy those numbers into components.

The Vite dev server rewrites `updated_at` to the current time when serving that file so the strip can be **Healthy** instead of immediately **Stale**. The file on disk keeps a fixed timestamp.

## Polling

One application-level source: `src/status/source.ts` (`statusSource`).

- Fetch immediately on start, then about every **60 seconds**.
- Skip ticks while the tab is hidden; fetch again when it becomes visible.
- Every menu metric reads the same snapshot. Do not add more timers in UI code.

## Stale detection

If `updated_at` is older than **15 minutes**, the status label is **Stale** instead of Running / Degraded / Offline. Numbers from the last valid payload stay on screen.

15 minutes is three quiet cycles if the exporter writes every few minutes and the site polls every 60 seconds.

## Failure states

| State | What you see |
| --- | --- |
| loading | Connecting and placeholder values |
| invalid JSON / HTTP error | Unavailable; last good numbers if any |
| stale timestamp | numbers remain, label is **Stale** |

A failed status fetch never blocks the hero, About, Agents, or Contact.

## Deploy

`npm run build` bakes the status URL into the bundle. GitHub Actions deploys `dist/` to GitHub Pages. Do not point this site at private hostnames or any control-plane machine.
