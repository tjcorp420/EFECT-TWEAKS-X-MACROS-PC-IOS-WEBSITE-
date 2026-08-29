# Current site audit

## Baseline findings

- The repository was a static, multi-page Vercel site with a Firebase-backed live catalog and Payhip purchase webhooks.
- Public navigation and product acquisition were split across repeated page shells, legacy monolithic CSS/JavaScript, and several redirects to external or retired destinations.
- The old affiliate experience redirected visitors into a separate hosted application and wrote Payhip affiliate parameters.
- Product key mappings did not cover every current public listing correctly.
- The admin password was retained in `sessionStorage`, uploads accepted active SVG content, and no shared security headers were configured.
- Fabricated review-card source assets were tracked beside real customer evidence.
- The static asset inventory remains large; product screenshots were preserved because they are real product evidence, but future image compression is recommended.

## Rebuild response

- One shared responsive shell now covers every public route.
- All public tabs have a purpose-built page and consistent route ownership.
- Catalog pages use the checked-in product inventory as a resilient fallback to the live API.
- Affiliate accounts, sessions, click attribution, sale confirmation, refunds, commissions, approval, and payout records are first-party EMX data.
- Fabricated review assets were removed; the vouches page displays only supplied evidence.
- Admin credentials are held in memory only, SVG uploads are rejected, and common response security headers are configured.

## Verified public routes

`/`, `/products.html`, `/bundles.html`, `/macros.html`, `/custom-os.html`, `/aim-trainer.html`, `/analyzer.html`, `/license.html`, `/vouches.html`, `/updates.html`, `/about.html`, `/faq.html`, `/contact.html`, `/links.html`, and `/affiliate.html`.

`/admin.html` remains a private `noindex` administration surface. Payhip header/brand-kit HTML files are repository tools and are excluded from the production artifact.
