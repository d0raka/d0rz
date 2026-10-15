# Custom domain: d0raka.cc

The site is built to `dist/` and published to the `gh-pages` branch. `public/CNAME` contains `d0raka.cc`, so every deploy keeps the custom domain (the deploy step cleans the branch, so the file must live in the source).

Canonical, Open Graph and Twitter URLs in `index.html` point to `https://d0raka.cc/`. Vite uses a relative `base` (`./`), so the same build also works at `https://d0raka.github.io/d0rz/`.

## DNS records at Spaceship

Remove the existing apex A records (`34.216.117.25`, `54.149.79.189` as of 2026-10-15) and any other A/AAAA/URL-redirect records for `@` and `www`, then add:

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA (optional) | @ | 2606:50c0:8000::153 |
| AAAA (optional) | @ | 2606:50c0:8001::153 |
| AAAA (optional) | @ | 2606:50c0:8002::153 |
| AAAA (optional) | @ | 2606:50c0:8003::153 |
| CNAME | www | d0raka.github.io |

Keep any MX/TXT records used for email.

## GitHub settings

1. Settings → Pages → Custom domain: `d0raka.cc`, then save.
2. Wait for the DNS check to pass, then enable **Enforce HTTPS**. Certificate issuance can take up to an hour or so.
3. Optional: verify the domain under account Settings → Pages to prevent takeover.

Reference: [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
