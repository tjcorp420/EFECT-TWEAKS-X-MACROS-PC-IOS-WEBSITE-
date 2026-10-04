# Nexus, WORLD, Pro Timer, and VEX purchase fulfillment

Verified Payhip listings on October 3, 2026:

| Product | Payhip code | Price | Storefront entitlement | Worker product | Key prefix |
| --- | --- | --- | --- | --- | --- |
| EMX VEX 1.0.0 | Ove0d | USD 15.99 | EMX_VEX | emx-vex | EMXVX |
| EMX Nexus 1.0.0 | SR4bJ | USD 10.99 | EMX_NEXUS | emx-nexus | EMXNX |
| EMX WORLD 0.5.0 | GUE6H | USD 5.00 | EMX_WORLD | emx-world | EMXWD |
| EMX Pro Timer Res Tuner 1.2.0 | 4ENPW | USD 5.00 | EMX_PRO_TIMER | emx-pro-timer | EMXPT |

The signature-checked Payhip webhook creates a distinct product-specific key per order. The shared paid-desktop adapter synchronizes the key to that product's isolated Cloudflare Worker before sending the existing license email. Sync failures prevent email and allow webhook retry. Retries reuse the receipt's original key and do not duplicate a successful email. Receipt recovery returns the saved product keys.

Each Worker is `https://<worker-product>-auth.tjcorp420.workers.dev`, with its own verification identity and sync credential. Nexus, WORLD, and Pro Timer each have their own D1 database. VEX uses exclusive `vex_licenses` and `vex_license_devices` tables in the existing Taskbar database because the Cloudflare account has reached its physical database limit; VEX SQL does not query the other product tables. The storefront uses `EMX_NEXUS_SYNC_SECRET`, `EMX_WORLD_SYNC_SECRET`, `EMX_PRO_TIMER_SYNC_SECRET`, and `EMX_VEX_SYNC_SECRET`; each matches the corresponding Worker's server-only `EMX_LICENSE_SYNC_SECRET`. Secrets never fall back to another product's authority. Optional endpoint overrides use the corresponding `EMX_*_LICENSE_SYNC_URL`.

Each key permits one PC with a lifetime entitlement. The application's encrypted saved verification allows up to 72 hours of offline use during transport failures. An EMX WORLD key does not include third-party provider rights.

The public catalog uses real application screenshots and canonical seed fields, so stale hosted catalog records cannot replace these product facts. Downloads remain on Payhip; private application source is not linked from the storefront.

Verification: `node --test tests/paid-*-fulfillment.test.js`, `npm test`, `npm run check`, and `npm run build`. The 28 focused tests cover mapping, coupon receipts, distinct key formats, isolated sync, failure handling, missing configuration, email ordering, retry idempotency, receipt recovery, and catalog facts. Live checkout/email verification requires an authorized coupon and is separate from mocked tests.

VEX code `Ove0d` was verified against the live Payhip listing at USD 15.99 with its setup ZIP shown. Its catalog uses the actual VEX 1.0.0 application capture. Its product-specific generation uses `EMXVX`, one-PC lifetime sync precedes email, and receipt retries/recovery retain the original key. The owner will perform the real coupon checkout and app activation test.
