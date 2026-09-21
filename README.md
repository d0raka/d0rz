# d0rz

Public homepage for **d0rz**: [d0rz.is-a.dev](https://d0rz.is-a.dev)

Vite + TypeScript static site. No private-server integration. The large **d0rz** wordmark with two marks in the `0` is the identity of the page — do not replace it.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default `http://localhost:5173`).

```bash
npm test          # status parser / formatters
npm run build     # typecheck + production bundle in dist/
npm run preview   # serve dist/
```

Live System in development reads `public/status.mock.json`. Production builds use `.env.production` (`VITE_PUBLIC_STATUS_URL` → the public `d0rz-status` JSON). Details: [docs/public-status.md](docs/public-status.md).

## Layout

1. Hero (wordmark, lede)
2. Live System (public workstation snapshot)
3. About / Agents / Contact
4. Footer

Copy for About, Agents, and Contact lives in `index.html`. Status numbers do not.

## Deploy

GitHub Actions (`.github/workflows/pages.yml`) runs `npm ci`, `npm test`, `npm run build`, and deploys `dist/` to GitHub Pages.

Production builds read `.env.production`:

```bash
VITE_PUBLIC_STATUS_URL=https://raw.githubusercontent.com/d0raka/d0rz-status/main/status.json
```

That is a public GitHub raw URL, not a secret. Do not add private hostnames, Tailscale names, SSH, or control-plane addresses.

Vite uses a relative `base` (`./`) so the same build works at `https://d0raka.github.io/d0rz/` and later at `d0rz.is-a.dev`. Custom-domain DNS is not attached yet. When is-a.dev is registered (a human-opened PR — do not generate that request with an assistant), add a `public/CNAME` file containing `d0rz.is-a.dev` and redeploy.

## Motion

Pointer sheen, typewriter kicker, live clock, and the two marks in the `0` tracking the cursor. The Live System health dot pulses only while the snapshot is healthy and fresh. All of that is skipped when `prefers-reduced-motion: reduce` is set.
