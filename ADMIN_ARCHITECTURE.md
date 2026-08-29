# Admin Architecture

Two operator surfaces deliberately have different responsibilities:

- Product Control Center (`/product-control`): catalog CRUD, visibility, pricing presentation, delivery configuration, screenshots/media, version, requirements, recovery, limitations, changelog, and intro order.
- Affiliate Command Center (`/affiliate-command`): affiliates, status and rate controls, referral-code regeneration, product attribution, conversions, commissions, payouts, CSV export, trend/funnel reporting, and a controlled diagnostic account.

Both use the server-side `ADMIN_PASSWORD` boundary. The password is held only in page memory and is discarded on refresh or lock. Public pages never expose admin APIs or secret material. Product and affiliate responsibilities must not be recombined into one dashboard.

The proposed Storefront Experience Editor remains a later isolated Product Control module. It should change validated `site-settings` values, not arbitrary HTML or JavaScript.
