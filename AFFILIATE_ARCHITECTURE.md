# Affiliate Architecture

The first-party affiliate system uses a 30-day browser referral window. A referral code from `/r/:code` is validated against an active Firebase affiliate before events are credited. Privacy-safe visitor and session hashes are stored; raw IP addresses and fingerprinting data are not stored.

Event funnel:

1. `referral_click` establishes a daily unique visit.
2. `product_view` records daily deduplicated product interest.
3. `checkout_open` records commercial intent.
4. `free_download` is a confirmed conversion with `grossCents: 0`, `revenueCents: 0`, and `commissionCents: 0`.
5. `paid_sale` is created only by the signed Payhip webhook and uses the referral/product metadata attached to checkout.

Affiliate status is `active`, `suspended`, `rejected`, `banned`, or `pending`; legacy `approved` and `disabled` records are normalized. Conversion IDs and event IDs are deterministic where idempotency matters. The Affiliate Command Center can create a marked test affiliate and exercise the production event/conversion functions without a fake purchase.

Commission accounting is separate from revenue and conversion counts. A free download improves conversion analytics without creating commission liability. Payouts cannot exceed pending commission. Admin mutations are written to the audit path.
