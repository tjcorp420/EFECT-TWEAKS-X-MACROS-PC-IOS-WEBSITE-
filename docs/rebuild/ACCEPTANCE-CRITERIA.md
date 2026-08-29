# Acceptance criteria

- Every public navigation destination loads and contains a complete main region.
- Desktop and mobile navigation expose all top-level destinations without covering controls.
- Product search, filters, details, and live-catalog fallback work without fabricated inventory.
- Checkout links retain the EMX referral code through Payhip metadata, not Payhip affiliate cookies.
- Affiliate passwords are hashed, sessions are `HttpOnly`, failed login attempts lock temporarily, and raw emails are not shown in dashboards/admin lists.
- Only approved accounts can accrue clicks or confirmed commissions.
- Purchase and refund events are idempotent and affect the affiliate ledger once.
- Payout records cannot exceed pending commission.
- Compatibility results are based only on user-entered data.
- The key claim form does not store receipt credentials in browser storage.
- Fabricated reviews and the retired external affiliate application are absent from the production artifact.
- Source validation, automated tests, production build, and browser QA outcomes are recorded truthfully.

## Verification record — 2026-08-29

- `npm run check`: passed; 181 source files checked for JavaScript syntax, JSON validity, local references, retired affiliate integration, legacy affiliate parameters, and fabricated review references.
- `npm test`: passed; 7 tests cover affiliate input/password boundaries, referral extraction, current license mappings, cumulative refund idempotence, Payhip signature validation, and admin secret comparison.
- `npm run build`: passed; `dist/` contains 157 production files totaling 70,325,802 bytes, with repository docs, tests, scripts, obsolete styles/scripts, stale VOLT captures, fake/review-source tooling, and Payhip design helpers excluded.
- Desktop browser QA: the homepage, three-column catalog, current VOLT page/gallery, bundle comparison, loading animation, and recommendation result were visually inspected at 1366 x 768 with no dialogs or horizontal overflow. Screenshot containers use `contain`, and the six public VOLT gallery captures preserve their source 1002 x 902 ratio.
- Mobile browser QA: `/`, `/products`, `/bundles`, `/macros`, `/custom-os`, `/aim-trainer`, `/affiliate`, and `/admin` fit a 390 x 844 viewport without broken images or horizontal overflow; the responsive navigation opened and exposed every top-level destination.
- Interaction QA: catalog filter/search/inline details/full-screenshot galleries, compatibility guidance, Setup Finder loading/recommendation states, and referral-to-checkout metadata passed. Product details remain in the document flow and no catalog dialog is rendered.
- Live Firebase, Vercel KV/Blob, email delivery, and signed Payhip purchase/refund processing were not executed because deployment credentials and a controlled transaction were not available in this local workspace.
