# Current Architecture

EMX is a static multi-page storefront with shared browser modules and serverless CommonJS APIs. The checked-in `products.js` catalog is the resilient public fallback; `/api/products` overlays the operator-managed Vercel KV catalog when configured.

- Homepage hub: semantic HTML, a supplied nebula background asset, dedicated responsive CSS, and vanilla JavaScript for the free-release panel and Discord copy action.
- Storefront: semantic HTML, shared CSS, vanilla JavaScript, responsive WebP previews with original PNG links.
- Product Control Center: `admin.html` manages catalog, media, release truth, delivery, and intro eligibility.
- Affiliate Command Center: `affiliate-admin.html` manages people, referral codes, attribution, conversions, commissions, diagnostics, and reporting.
- Product persistence: Vercel KV REST API.
- Affiliate persistence: Firebase Realtime Database through `firebase-admin`.
- File persistence: Vercel Blob; product packages use authorized browser-to-Blob multipart uploads.
- Paid fulfillment: current Payhip checkout and signed webhook remain authoritative for paid orders and license automation.
- Free fulfillment: `/api/download` resolves the catalog delivery route and records a real `$0` conversion when a valid affiliate referral exists.

No browser receives Firebase, KV, Blob write, Payhip, or admin credentials. `ADMIN_PASSWORD` remains server-validated and memory-only in admin pages.
