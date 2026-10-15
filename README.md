# d0rz

Public homepage for d0rz: [d0rz.is-a.dev](https://d0rz.is-a.dev)

A static site. The Live System strip reads public JSON from [d0rz-status](https://github.com/d0raka/d0rz-status). It does not talk to a private server. The large **d0rz** wordmark, with two marks in the `0`, is the identity of the page.

## Features

- Hero with the wordmark (the two marks follow the pointer)
- Live System: health, CPU, memory, disk, uptime, agents, and services
- About, Agents, and Contact copy in `index.html`
- Motion is skipped when `prefers-reduced-motion: reduce` is set

## Tech stack

- TypeScript and Vite
- Vitest for the status parser and formatters
- GitHub Actions and GitHub Pages

## Setup

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

| Script | What it does |
| --- | --- |
| `npm test` | Status parser and formatters |
| `npm run build` | Typecheck and production bundle in `dist/` |
| `npm run preview` | Serve `dist/` |
| `npm run dev:live` | Dev server that fetches the public status JSON |

`npm run dev` uses `public/status.mock.json`. Production builds and `npm run dev:live` use the public d0rz-status URL. Set `VITE_PUBLIC_STATUS_URL` only to point somewhere else. Copy `.env.example` to `.env` for that override. Do not commit `.env` files.

## Usage

The page is one scroll: hero, Live System, About / Agents / Contact, footer. Status numbers come from the JSON feed. The other copy lives in `index.html`.

Field rules and polling: [docs/public-status.md](docs/public-status.md).

GitHub Actions (`.github/workflows/pages.yml`) runs the tests and the production build, then deploys `dist/` to GitHub Pages. Vite uses a relative `base` (`./`), so the same build works at `https://d0raka.github.io/d0rz/` and at `d0rz.is-a.dev`. A `public/CNAME` file is what attaches the custom domain once DNS is ready.

## License

MIT. See [LICENSE](LICENSE).
