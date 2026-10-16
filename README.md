# d0rz

My personal site, live at [d0raka.cc](https://d0raka.cc).

## What's on it

- A desktop-style layout with draggable windows for About, Projects and my CV.
- On smaller screens, one content window is shown at a time and the page scrolls clear of the fixed dock.
- Selected projects: Courtside Tennis (with a live preview of the game), KeepSafe and Server Control.
- A menu bar with live stats from my server: status, CPU, memory, disk, uptime and platform. The data comes from a public `status.json` in [d0rz-status](https://github.com/d0raka/d0rz-status), which the server updates every 5 minutes. The site checks it about once a minute. It never connects to the server directly.

## Tech stack

- TypeScript
- Vite
- Vitest
- GitHub Actions and GitHub Pages

## Local development

```bash
npm install
npm run dev       # dev server, uses public/status.mock.json
npm run dev:live  # dev server with the real status feed
npm test
npm run build     # typecheck and build to dist/
```

To use a different status feed, copy `.env.example` to `.env` and set `VITE_PUBLIC_STATUS_URL`.

## Deployment

Every push to `main` runs `.github/workflows/pages.yml`. The workflow runs the tests, builds the site and publishes `dist/` to the `gh-pages` branch, which GitHub Pages serves.

The custom domain is set in `public/CNAME`. The DNS for `d0raka.cc` points to GitHub Pages: apex A records `185.199.108.153` to `185.199.111.153`, plus a `www` CNAME to `d0raka.github.io`.

## Project structure

```
index.html          page markup and project content
src/
  main.ts           entry point
  desktop.ts        windows, dock and layout
  hero.ts           the DOR wordmark
  styles.css
  status/           fetching, parsing and formatting the status feed
public/             favicons, og image, CV PDF, CNAME
assets/             icons used in the page
```

## Contact

- [LinkedIn](https://www.linkedin.com/in/d0raka/)
- [GitHub](https://github.com/d0raka)

## License

MIT, see [LICENSE](LICENSE).
