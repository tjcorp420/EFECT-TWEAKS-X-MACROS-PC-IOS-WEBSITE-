# EMX TWEAKS Website Agent Instructions

## Mission

Maintain and deliberately rebuild the official EMX TWEAKS storefront and product hub. The site must feel like premium enthusiast PC software: focused, technical, responsive, polished, and trustworthy. It must not resemble a generic SaaS template, a cheat storefront, a crypto site, or an RGB-heavy novelty page.

## Required reading order

Before a material change, read:

1. `PROJECT.md`
2. `PRODUCT.md`
3. `DESIGN.md`
4. `ARCHITECTURE.md`
5. `ROADMAP.md`
6. The relevant file under `docs/`

## Non-negotiable rules

- Inspect the current implementation before editing it. Search before adding a component, utility, data field, route, or asset.
- Preserve working checkout, download, license-claim, referral, webhook, admin, and recovery behavior unless a tested replacement is ready.
- Never fabricate product interfaces, compatibility, benchmarks, FPS or latency gains, system information, reviews, ratings, download counts, customer counts, or security claims.
- Only public/sellable or explicitly upcoming products belong in public catalog surfaces. Keep retired products out of current product feeds and keep private/admin/development products off public pages.
- Use real EMX product captures. Review every public asset for license keys, email addresses, transaction IDs, machine IDs, or other private information.
- Keep product facts in `products.js` until the catalog migration in `ROADMAP.md` is approved. Do not duplicate prices, versions, status, or checkout URLs in new UI.
- Treat `api/`, `admin.html`, `admin.js`, `license.html`, and checkout/download code as security-sensitive.
- Secrets belong in environment variables. Never print, commit, or expose them to client code.
- System modifications advertised by a product must describe preview, backup, rollback, and post-change verification honestly.
- Add dependencies only when the existing stack or standard platform APIs cannot solve the problem cleanly.
- Make focused, reversible patches. Do not combine a site-wide migration with unrelated content changes.

## Architecture rules

- Current stack: static multi-page HTML/CSS/JavaScript on Vercel plus CommonJS Vercel Functions.
- Shared visual primitives belong in `foundation.css`; shared progressive-enhancement behavior belongs in `foundation.js`.
- Page-specific CSS may extend the foundation but must not silently redefine the brand system.
- Storefront product data is read from `/api/products` with `products.js` as the resilient seed/fallback.
- UI communicates with backend functions through same-origin `/api/*` requests. Never expose storage, Firebase, Resend, Payhip, or admin credentials in browser code.
- Expected failures must return a safe user message and a non-success HTTP status. Server responses must not leak provider credentials, stack traces, or raw customer data.
- Server-side logs may contain event IDs and masked identifiers, never license keys, full emails, credentials, or request bodies containing customer data.
- Use lowercase kebab-case for new HTML/CSS/JS filenames. Use descriptive asset folders under `assets/`.

## Verification required after changes

Run the checks that apply:

```powershell
npm install
npm run check
npm run build
```

For UI changes, also serve the repository locally and verify the affected flows at desktop and mobile widths, keyboard focus, reduced motion, console errors, broken assets, and link behavior. For backend changes, add focused tests or deterministic handler-level smoke checks. Never report production behavior as verified when credentials or live provider state were unavailable.

## Release boundaries

- A local build is not a production deployment.
- A Vercel preview is not a reviewed production release.
- Do not push, deploy, alter production data, rotate credentials, or run a committed webhook test without explicit authorization.
- Preserve a clean diff and document unresolved production-only gates.
