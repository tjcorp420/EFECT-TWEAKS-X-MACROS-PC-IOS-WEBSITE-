# EMX Web Architecture

## Current architecture

The repository is a static multi-page application deployed by Vercel:

```text
*.html                  public routes
foundation.css/js       shared design and progressive enhancement
home-v3.css             current homepage product-showcase layout
site.css/site-shell.js  shared public-route layout and navigation
catalog.css/catalog.js  catalog cards, filters, galleries, and product quick-view modal
storefront-intro.*      database-driven cinematic home introduction
affiliate-admin.*       Affiliate Command Center
admin.*                 Product Control Center
products.js             catalog seed and browser fallback
api/*.js                CommonJS Vercel Functions
assets/, app-screenshots/, media/, downloads/
vercel.json             rewrites, headers, deployment behavior
```

There is no framework router, TypeScript configuration, or CSS build pipeline. Node's built-in test runner covers critical server behavior. Esbuild bundles only the Vercel Blob browser uploader; the storefront itself remains framework-free.

## Runtime boundaries

- Public HTML/CSS/JavaScript may contain public product facts and links only.
- `/api/products` may read public catalog data without authentication. Mutations require server-side admin authorization.
- `/api/affiliate-admin`, `/api/product-upload`, `/api/upload`, and test endpoints contain privileged operations and authenticate server-side.
- `/api/analytics-track` accepts only bounded same-origin first-party events and never accepts revenue.
- `/api/download` resolves catalog delivery and attempts analytics independently so telemetry failure does not deny a valid file.
- `/api/payhip-webhook` verifies Payhip's documented SHA-256 API-key signature before any write.
- `/api/license-lookup` reads Firebase using server credentials. It must never expose data beyond the receipt-scoped response.
- Firebase, Vercel KV, Vercel Blob, Payhip, and Resend credentials are server-only environment variables.

## State rules

- Product catalog: remote `/api/products` first, `products.js` fallback, with an explicit stale/fallback UI in the future catalog phase.
- Affiliate referral preference: device-local storage with a 30-day timestamp; session/visitor IDs are privacy-safe random identifiers.
- Admin credentials remain in page memory only and are sent to protected server endpoints for the active page session; they are never written to browser storage.
- Customer emails, transaction IDs, and license keys must not enter local storage or analytics.

## Error pattern

Server functions return JSON with a stable `ok` boolean and safe `error` string. Use 4xx for invalid input/auth/not found/rate limit and 5xx for provider or server failure. Responses are `no-store`. Do not return stack traces or raw upstream responses.

Browser UI maps errors to a specific state, keeps user input when safe, offers retry for transient failures, and always exposes a support path for purchase/license failures.

## Logging pattern

Log event name, request/event ID, route, result, provider status, and duration. Mask email addresses and transaction IDs. Never log request authorization headers, service credentials, license keys, full webhook payloads, or uploaded file contents.

## Migration policy

Do not migrate to Next.js/React/Tailwind solely because the pasted planning chat suggested it. A later architecture decision must compare:

- the cost of consolidating duplicated static routes;
- server/client and metadata requirements;
- Vercel Function compatibility;
- deployment and rollback risk;
- accessibility/performance impact;
- testability and maintenance.

Until that decision is accepted, build shared primitives in plain HTML/CSS/JavaScript and keep production routing stable.

## Verification pipeline

`npm run check` performs deterministic source validation and JavaScript syntax checks. `npm run build` produces a clean static artifact under `dist/` while excluding repository-only, admin-only, test, and known fabricated-review source assets. Vercel Function integration still requires a Vercel preview with configured environment variables.
