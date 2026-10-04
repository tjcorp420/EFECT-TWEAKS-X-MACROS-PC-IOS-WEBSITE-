# Taskbar Studio purchase fulfillment

Payhip product `sAu8f` (`https://payhip.com/b/sAu8f`) is EMX Taskbar Studio,
listed at USD 10.99 on October 3, 2026. The paid setup is version 1.0.0.
Customer packages remain on Payhip; no source or public direct download is added.
The gallery uses original user-supplied application screenshots from earlier builds.

## License boundaries

- Storefront entitlement: `EMX_TASKBAR_STUDIO`
- Application / Worker product: `emx-taskbar-studio`
- Key format: `EMXTS-XXXXXXXX-XXXXXXXX-XXXXXXXX` (96 random bits)
- Worker: `https://emx-taskbar-studio-auth.tjcorp420.workers.dev`
- D1 database: `emx_taskbar_studio_auth`
- One PC, lifetime entitlement; the app provides up to 72 hours of verified offline use.

The signature-checked Payhip webhook persists a distinct Taskbar key per order,
synchronizes it to the isolated Worker, then sends the existing EMX license email.
Failed activation sync or delivery returns an error so Payhip can retry. Retries
reuse the receipt's original key and do not duplicate an already sent email.
Activation sync is checked before sending mail on both initial and retried orders.
The receipt-scoped license lookup and email resend APIs return the saved key.

## Production configuration

Storefront `EMX_TASKBAR_STUDIO_SYNC_SECRET` must match the Worker's
`EMX_LICENSE_SYNC_SECRET`. It intentionally cannot fall back to another product's
secret. Optional endpoint override: `EMX_TASKBAR_STUDIO_LICENSE_SYNC_URL`.
Never expose these values in client code, CLI arguments, logs or documentation.

## Verification

Run `node --test tests/taskbar-studio-fulfillment.test.js`, `npm run check`,
`npm test`, and `npm run build`. Unit tests cover mapping, coupon receipts,
format, isolated sync, provider failures, missing configuration, blocked email,
retry idempotency, receipt recovery, and the paid catalog.

## Live verification on October 3, 2026

- Production catalog and product details show version 1.0.0, USD 10.99, the
  correct Payhip checkout, original screenshots, and one-PC requirements.
- The merchant-authorized 100% coupon checkout completed at USD 0.00.
- Payhip delivered the customer receipt and download email. The separate
  `Your EMX license key` email arrived in the authorized Gmail inbox, identifying
  Taskbar Studio and the matching transaction. No raw key is recorded here.
- The downloaded Setup ZIP exactly matched the tested release SHA-256:
  `0fee2c0ac0c56e78420ed915378e5d7b397a8e7f735f468e1736639f7beb559e`.
- The real signature-checked Payhip webhook returned HTTP 200, receipt lookup
  recovered the distinct EMXTS key, and the release's exact application assembly
  accepted that purchased key and its encrypted cache in a fresh process.
- The shared recovery site's product catalog now recognizes
  `EMX_TASKBAR_STUDIO` / `emx-taskbar-studio`; Sites version 19 deployed successfully.
- Storefront validation, all 74 tests, and the production build passed. Shared
  recovery-site formatting, lint, type checking, nine compatibility tests and
  its production build passed.

Existing uncommitted storefront work was preserved. Public updates still point
to 0.1.9; this purchase launch did not publish the paid installer as a public update.
