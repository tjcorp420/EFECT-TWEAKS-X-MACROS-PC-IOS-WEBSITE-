# EMX TWEAKS Product Specification

## Audience

The primary audience is Windows gamers and power users who want understandable performance tools, macro configuration, creator utilities, and setup software without exaggerated claims. Secondary audiences are existing EMX customers recovering access and community members looking for free tools or support.

## Core journeys

1. Discover and compare current products.
2. Inspect real screenshots, features, compatibility, risks, and recovery behavior.
3. Continue to a verified Payhip checkout or an official direct download.
4. Claim or recover a purchased EMX license.
5. Find release notes, known requirements, and support.
6. Join or use the affiliate program without losing the visitor's intended click.

## Navigation model

Primary: Home, Products, Bundles, Macros, Free Tools, Aim Trainer, Claim Key.

Secondary: Updates, About, FAQ, Support, Affiliate, privacy/terms when legal copy is supplied and reviewed.

Admin tools are never part of public navigation.

## Product truth model

Each catalog record must eventually include:

- stable ID and slug;
- public title and concise purpose;
- category and lifecycle status;
- current version and release channel;
- price and previous price only when verified;
- platform, OS versions, architecture, hardware/provider requirements, and admin requirements;
- features and explicit limitations;
- real logo, cover, screenshots, and optional video;
- official acquisition URL, release notes, documentation, support, and license-claim behavior;
- safety/recovery information for products that change system settings;
- `updatedAt` plus source of truth.

Current product facts remain in `products.js` during the foundation phase. The catalog presently exposes EMX Custom OS, Windows Tweak Dashboard, EMX Clips, EMX VOLT Macro, EMX FPS Booster, and the Windows Tweaks + VOLT bundle. Retired macro/controller/bundle entries remain historical data but must not be shown as current.

## Required states

- Catalog: loading, populated, empty, stale/fallback, and failed.
- Checkout: available, unavailable, redirecting, canceled, and returned.
- Download: ready, unavailable, started, and verification instructions.
- License claim: idle, validating, success, not found, invalid input, provider unavailable, rate limited, and recovery/support.
- Media: loading, loaded, missing, unsupported, and reduced-data fallback.

## Content rules

- Never promise a specific FPS, ping, latency, temperature, or performance gain without reproducible product-specific evidence and context.
- Describe manufacturer limits as limits, not normal operating targets.
- Do not describe browser inference as a hardware scan.
- Reviews/vouches must be traceable to real supplied evidence and scrubbed of private information. Fabricated avatar/review assets are prohibited from production.
- Clearly label unsigned Windows installers and provide a verified checksum and publisher status.
- Every direct system-changing feature must explain backup and restore behavior.

## Out of scope for the foundation phase

- Account/authentication redesign.
- New checkout or payment provider.
- Live licensing data migration.
- Full route rewrite or framework migration.
- New claims about product compatibility or performance.
- Publishing or production data changes.
