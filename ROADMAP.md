# EMX Website Rebuild Roadmap

## Phase 0 - Audit and specification

Status: completed in `docs/rebuild/CURRENT-SITE-AUDIT.md` and related specifications.

Acceptance: stack, routes, catalog, assets, integrations, security, performance, accessibility, working pieces, and migration risks are documented from repository evidence.

## Phase 1 - Foundation

Status: in progress.

Deliver:

- shared design/accessibility tokens;
- skip navigation and visible keyboard focus;
- accessible mobile navigation primitive;
- reduced-motion and forced-colors support;
- predictable shared page-width and control primitives;
- non-blocking affiliate entry behavior;
- baseline security headers and safer media upload types;
- deterministic check/build scripts and contributor instructions.

Acceptance: homepage remains recognizable, key links work on desktop/mobile/keyboard, no first-click interception remains, checks/build pass, and no checkout/license/API contract changes are introduced.

## Phase 2 - Catalog and content source of truth

Normalize the product schema, remove duplicated product facts from route markup, add lifecycle/compatibility/release/recovery fields, expose stale/fallback UI, and confirm every current listing against Payhip and release sources.

Dependency: Phase 1. Production catalog and Payhip review required.

## Phase 3 - Shared shell and route consolidation

Replace copied header/footer/drawer/boot/modal markup across legacy pages with shared, accessible rendering. Remove forced boot gates and duplicated storefront sections while preserving route URLs.

Dependency: Phases 1-2.

## Phase 4 - Homepage and discovery

Complete the premium homepage, product category system, real product showcase, comparison guidance, compatibility summary, and free tools path.

Dependency: Phases 1-3.

## Phase 5 - Product detail and bundles

Create one reusable product-detail pattern with real galleries, compatibility, requirements, limitations, recovery, checkout/download, releases, and support. Rebuild current product and bundle routes.

Dependency: Phases 2-4.

## Phase 6 - Customer recovery and admin security

Rate-limit receipt lookup and privileged APIs, replace raw browser password storage with secure sessions, validate upload bytes, add audit events, define webhook/refund behavior, and test recovery/provider failures.

Dependency: architecture/security review and configured preview environment.

## Phase 7 - Support, updates, legal, and SEO

Rebuild updates/FAQ/support/about, add reviewed privacy/terms text, canonical metadata, route-specific social metadata, sitemap, robots, and structured product data.

## Phase 8 - Performance, accessibility, and release QA

Optimize real media, set budgets, run keyboard/screen-reader/browser checks, test all external and internal links, validate Core Web Vitals, test production-like APIs, and produce `docs/rebuild/FINAL-AUDIT.md`.

## Phase 9 - Production release

Create a reviewed preview, verify environment variables and provider callbacks, run checkout/license/download smoke tests, approve rollback, then deploy. Build, preview, production deploy, and live-provider verification are reported separately.
