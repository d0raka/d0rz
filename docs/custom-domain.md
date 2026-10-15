# Moving d0rz to d0raka.cc

The current site stays at `https://d0raka.github.io/d0rz/` until DNS and GitHub Pages both recognize the new domain. The repository publishes the built `dist/` directory to the `gh-pages` branch, so the domain file belongs in `public/CNAME`; Vite copies it to the published root.

## Current DNS check (2026-10-15)

- `d0raka.cc` A records: `34.216.117.25`, `54.149.79.189`
- `www.d0raka.cc` CNAME: none

These A records are not GitHub Pages addresses. Confirm whether another service currently uses the domain before replacing them.

## When ready to switch

1. At the DNS provider, replace the apex A records with GitHub Pages' four addresses: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Remove conflicting A/AAAA records. If the provider supports ALIAS/ANAME, that can point to `d0raka.github.io` instead.
2. Add `www` as a CNAME pointing directly to `d0raka.github.io` (without `/d0rz`).
3. In repository **Settings → Pages**, set the custom domain to `d0raka.cc`. GitHub may write its own CNAME file to the publishing branch; the next deploy should retain it by also adding `d0raka.cc` to `public/CNAME` on the source branch.
4. Verify DNS and HTTPS in Pages settings, then enable **Enforce HTTPS**. DNS and certificate issuance can take time.
5. After `https://d0raka.cc/` works, update the canonical and Open Graph URLs in `index.html`, and replace the site link in `README.md`.

The existing relative Vite asset base (`./`) works at both the repository path and the apex domain.

Reference: [GitHub's custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).
