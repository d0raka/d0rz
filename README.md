# d0rz

[![CI](https://github.com/d0raka/d0rz/actions/workflows/pages.yml/badge.svg)](https://github.com/d0raka/d0rz/actions/workflows/pages.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

Public homepage for Dor Aka: [d0raka.github.io/d0rz](https://d0raka.github.io/d0rz/)

A static, desktop-inspired personal site. The menu bar reads public JSON from [d0rz-status](https://github.com/d0raka/d0rz-status). The site does not talk to a private server. Dor Aka's name is the main wordmark, with eyes in the `o`.

## Demo

- Live site: [d0raka.github.io/d0rz](https://d0raka.github.io/d0rz/)

## Features

- Hero with Dor Aka's name (the eyes in the `o` follow the pointer)
- Menu bar: running state, CPU, memory, disk, uptime, platform, and last update
- Dock links for GitHub and X, plus an in-site CV window awaiting the source PDF
- About, Work, and Contact windows in `index.html`
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

The desktop layout shows the hero, three windows (About, Work, Contact), and a fixed dock. Narrow screens stack the content and wrap the menu metrics. Status numbers come from the JSON feed. Other copy lives in `index.html`. The CV app currently contains a clearly labeled placeholder until Dor provides the PDF.

Field rules and polling: [docs/public-status.md](docs/public-status.md).

GitHub Actions (`.github/workflows/pages.yml`) runs the tests and the production build, then deploys `dist/` to GitHub Pages. Vite uses a relative `base` (`./`), so the same build works at `https://d0raka.github.io/d0rz/` and `https://d0raka.cc/`. The domain migration steps and current DNS state are in [docs/custom-domain.md](docs/custom-domain.md).

## License

MIT. See [LICENSE](LICENSE).
