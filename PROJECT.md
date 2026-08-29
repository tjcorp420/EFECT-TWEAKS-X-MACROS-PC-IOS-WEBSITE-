# EMX TWEAKS Website

## Purpose

EMX TWEAKS is the public storefront and product hub for EMX Windows software, tweaks, macros, creator utilities, downloads, release information, support, and post-purchase license recovery.

The primary visitor should be able to answer these questions quickly:

1. What is EMX?
2. Which products are current?
3. What does each product actually do?
4. What platform, privileges, and hardware does it require?
5. Is it paid, bundled, retired, or free?
6. Where can it be obtained safely?
7. How are changes reversed or support requested?

## Current repository scope

This repository currently owns:

- a static multi-page public storefront;
- a central JavaScript product catalog with a KV-backed override;
- Payhip checkout and affiliate-link flows;
- receipt-based EMX license lookup and Payhip webhook automation;
- a password-gated browser admin panel for catalog, media, and referral management;
- direct and redirected downloads;
- Vercel deployment routing and serverless functions.

The macro experience at `https://emx-macros.vercel.app/` and the affiliate application are external systems. They must be treated as integrations, not silently copied into this codebase.

## Rebuild outcome

The rebuild will produce one coherent EMX product ecosystem with a premium dark visual language, restrained neon green and electric purple accents, real product imagery, intentional motion, responsive page structures, explicit product truth, safe checkout/download flows, and maintainable shared code.

This is a staged rebuild. The current static stack remains the production baseline until a later architecture decision proves that a migration has lower risk than incremental consolidation.

## Success measures

- Visitors can identify and compare current products without opening multiple unrelated interfaces.
- Every current product has accurate status, compatibility, pricing, media, acquisition, support, and recovery information.
- No public page exposes private/admin content or fabricated proof.
- Key flows work with keyboard, touch, reduced motion, and common mobile/desktop widths.
- Shared navigation, footer, tokens, controls, and status patterns are consistent.
- Automated repository validation, syntax checks, and the production packaging check pass.
- Production-only integrations have documented smoke tests and rollback procedures.
