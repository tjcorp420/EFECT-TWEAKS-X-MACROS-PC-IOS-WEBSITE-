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

- Responsive first-party Affiliate and Support paths in the main navigation and checkout areas
- Homepage EMX TWEAKS HUB with official product, Discord, Fortnite, free-utility, and subdomain paths
- Five current free releases available directly from the homepage utility panel
- Central multi-product license recovery at `https://activate.emxtweaks.com/activate`
- Full-frame product screenshot carousels with Previous/Next controls and thumbnail rails
- Answer-based Setup Finder with optional Windows, GPU, input, and price preferences
- Side-by-side product comparison and visible release, requirement, recovery, and limitation details
- Immediately active first-party affiliate onboarding with real visit, product-view, checkout, free-download, and paid-sale attribution
- Separate Product Control and Affiliate Command admin applications
- Real `$0` conversion records for referred free downloads, with deterministic deduplication
- Premium product quick-view modals and a database-driven, replay-safe cinematic home intro
- Direct package uploads with progress, multipart support, and client/server magic-signature validation

## Configuration

The server functions require the existing Firebase Admin configuration (`FIREBASE_SERVICE_ACCOUNT_JSON` or the project/client/private-key variables). Product/settings persistence uses `KV_REST_API_URL` and `KV_REST_API_TOKEN`. Uploads use `BLOB_READ_WRITE_TOKEN`. License automation requires `PAYHIP_API_KEY`; optional delivery mail uses the existing Resend settings. `ADMIN_PASSWORD` protects both admin applications. `EMX_DEFAULT_AFFILIATE_RATE_BPS` optionally sets the initial commission rate in basis points. Never place these values in source or client-side files.

Start with `CURRENT_ARCHITECTURE.md`, `AFFILIATE_ARCHITECTURE.md`, `PRODUCT_DELIVERY_ARCHITECTURE.md`, and `SECURITY_NOTES.md` for the current boundaries.
