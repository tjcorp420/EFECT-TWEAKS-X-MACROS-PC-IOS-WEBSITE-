# EMX Tweaks x Macros website

The EMX storefront is a static multi-page site with Vercel Functions for the live catalog, product uploads, license automation, receipt-based license recovery, and the first-party EMX affiliate program.

## Local development

```powershell
npm install
npx serve@14.2.4 . -l 4173
```

For Vercel Functions and configured environment variables, use `vercel dev` in a linked development environment.

## Verification and build

```powershell
npm run check
npm test
npm run optimize:images
npm run build
```

`optimize:images` creates 640px and 960px WebP derivatives for public screenshots while leaving every original PNG/JPG available for full-resolution viewing. `npm run build` first bundles the secure browser-to-Blob product uploader, then creates `dist/`. Repository documentation, source build scripts, tests, and review-only folders are excluded; the two admin applications are part of the deployed product.

## Current storefront features

- Compare and Updates read the live public catalog with an eight-second timeout,
  a labeled bundled fallback, refresh, search, and category filtering.
- Compare supports up to four selected products; Updates excludes bundles and
  shows catalog-listed versions and available notes without claiming a live
  updater check. Missing facts are labeled rather than inferred.
- Compare, Updates, and Help are primary navigation destinations; secondary
  destinations including FAQ remain available in the keyboard-accessible More menu.
- EMX Tweaks Pro is draft/hidden in both bundled data and API reconciliation;
  change its source visibility fields only when public availability is authorized.

- Responsive first-party Affiliate and Support paths in the main navigation and checkout areas
- Homepage EMX TWEAKS HUB with official product, Discord, Fortnite, free-utility, and subdomain paths
- Three current free releases available directly from the homepage utility panel
- Payhip reconciliation on October 5, 2026: Control Hub and Window Deck are
  hidden without deleting historical records or packages; ReelFree links to its
  official $1 Payhip listing. Clips retains the newer free website release while
  its older $1 Payhip listing remains a content/delivery decision to reconcile.
- Central multi-product license recovery at `https://activate.emxtweaks.com/activate`
- Full-frame product screenshot carousels with Previous/Next controls and thumbnail rails
- Answer-based Setup Finder with optional Windows, GPU, input, and price preferences
- Side-by-side product comparison and visible release, requirement, recovery, and limitation details
- Immediately active first-party affiliate onboarding with real visit, product-view, checkout, free-download, and paid-sale attribution
- Separate Product Control and Affiliate Command admin applications
- Real `$0` conversion records for referred free downloads, with deterministic deduplication
- Premium product quick-view modals and a database-driven, replay-safe cinematic home intro
- Direct package uploads with progress, multipart support, and client/server magic-signature validation

## Homepage search appearance

`index.html` owns the homepage title, search description, Open Graph/Twitter
sharing metadata, and `WebSite` JSON-LD identifying the site as EMX TWEAKS.
Keep the search and sharing descriptions aligned. The favicon uses the existing
square EMX logo at the stable `/emx-logo-v2.png` URL.

After publishing metadata changes, use Google Search Console's URL Inspection
tool on `https://emxtweaks.com/` and request indexing. Google selects the final
site name, title, snippet, and favicon; deployment does not guarantee an immediate
search-result update. Crawling and processing can take days to weeks.

`sitemap.xml` lists the preferred canonical URLs of 15 public discovery pages;
`robots.txt` advertises it without blocking the assets crawlers need. Account,
admin, API, and redirected legacy pages are excluded from the sitemap. Sitemap
exclusion is not access control. When adding a public page, add its canonical URL
and sharing metadata, update the sitemap, and run `npm test` and `npm run build`.
Submit `https://emxtweaks.com/sitemap.xml` in Search Console's Sitemaps report.

## Configuration

The server functions require the existing Firebase Admin configuration (`FIREBASE_SERVICE_ACCOUNT_JSON` or the project/client/private-key variables). Product/settings persistence uses `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Uploads use `BLOB_READ_WRITE_TOKEN`. License automation requires `PAYHIP_API_KEY`; optional delivery mail uses the existing Resend settings. `ADMIN_PASSWORD` protects both admin applications. `EMX_DEFAULT_AFFILIATE_RATE_BPS` optionally sets the initial commission rate in basis points. Never place these values in source or client-side files.

Start with `CURRENT_ARCHITECTURE.md`, `AFFILIATE_ARCHITECTURE.md`, `PRODUCT_DELIVERY_ARCHITECTURE.md`, and `SECURITY_NOTES.md` for the current boundaries.
