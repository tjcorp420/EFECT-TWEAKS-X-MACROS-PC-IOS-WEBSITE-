# First-party EMX affiliate program

## Ownership boundary

EMX owns affiliate accounts, credentials, sessions, referral codes, first-party events, conversions, commission calculations, reversals, and payout records in Firebase Realtime Database. No paid affiliate platform is required.

Payhip remains the current purchase processor. EMX referral links add `metadata[emx_ref]` to the official checkout URL. Payhip includes checkout metadata in its webhook payload, and the signed completed-sale/refund webhook is the purchase evidence used by the EMX ledger.

## Flow

1. A creator creates an immediately active account or signs in at `/affiliate.html`.
2. `/r/{code}` stores a 30-day first-party attribution value and records a daily-deduplicated visit.
3. Product visibility and checkout interactions record product-view and checkout-open events.
4. A referred free download records a confirmed `free_download` conversion with `$0` revenue and commission.
5. EMX checkout links carry `metadata[emx_ref]` and `metadata[emx_product]`.
6. The signed Payhip webhook records the unique `paid_sale`; refund webhooks reverse pending commission idempotently.
7. Affiliate Command can suspend or ban accounts, adjust rates, investigate product performance, run the real test path, and record externally completed payouts. It does not claim to transmit money automatically.

## Security and privacy

- Passwords use `scrypt` with per-account random salts.
- Session tokens are random, stored by SHA-256 digest, expire after seven days, and use `HttpOnly`, `SameSite=Lax`, and `Secure` on HTTPS.
- The public/admin projections use masked email addresses and never return password records.
- Signup reserves referral codes atomically.
- Login attempts lock the account temporarily after repeated failures.
- Visits and product events are deduplicated by affiliate, privacy-safe visitor ID, UTC day, event type, and product scope.
- Free conversions are deterministic per affiliate/visitor/product; paid conversion/refund transactions are idempotent by external sale ID.

## Required operations

Before production use, configure Firebase Admin, `PAYHIP_API_KEY`, and `ADMIN_PASSWORD` in the deployment environment. Use Affiliate Command to create a marked test account and download a real free tool through its referral URL; confirm one zero-dollar conversion without a fake purchase. Separately validate paid webhook fixtures and perform a controlled purchase/refund only when a safe test method is available. Automatic bank, PayPal, or cash-app disbursement is intentionally outside this self-contained tracking system.
