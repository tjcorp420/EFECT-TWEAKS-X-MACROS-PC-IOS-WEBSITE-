# September 30, 2026 - VOLT and FPS product media refresh

- VOLT storefront metadata updated to v0.1.76 from user-supplied captures.
- Five VOLT captures replace the public gallery; the Dashboard + VOLT bundle reuses the updated captures.
- Two FPS Booster captures replace the public gallery. Existing v1.0.24 release metadata retained.
- FPS canonical media fields now override stale KV gallery values, matching the existing VOLT policy.
- FPS Settings capture excluded because it includes a hardware identifier.
- Payhip VOLT and FPS galleries replaced; VOLT copy labels screenshot version v0.1.76.
- Prices, licensing settings, and downloadable Payhip ZIPs were not changed. New package delivery was not verified.

Verification: npm run check passed; npm test passed 58/58; npm run build passed; Vercel production deployment ready and aliased to emxtweaks.com. Live catalog fields verified and all seven website image responses matched local supplied bytes. VOLT storefront carousel open/next verified; no captured warnings/errors in that browser tab. Both Payhip public galleries checked for loaded replacement images.

Production deployment: https://efect-tweaks-x-macros-pc-ios-website-8jygidacq.vercel.app
Previous deployment for rollback: https://efect-tweaks-x-macros-pc-ios-website-orosj4ffq.vercel.app

Files changed for this task: products.js, api/products.js, tests/product-catalog.test.js, assets/emx-volt-v0.1.76/, assets/emx-fps-current/.
The checkout already contained unrelated edits; those were preserved. No Git commit was created.
Vercel emitted an npm allowScripts warning for existing Firebase util, esbuild, and protobufjs dependencies; the production build completed successfully without dependency changes.


## Storefront follow-up
- Selected catalog gallery images load eagerly; opening a gallery also loads every thumbnail, including thumbnails outside the visible rail.
- Removed large policy banners from Products, Bundles, and Macros; policies remain in shared footer navigation and bundle checkout links.
- Replaced standalone Macro and Bundle VOLT imagery with supplied v0.1.76 screenshots.
- Release labels on Updates, Macros, and Bundles read the checked-in catalog through release-versions.js, with HTML fallbacks. This is catalog synchronization, not automatic discovery of future app releases.
- Macro trust copy describes creator/community usage history supplied by the owner; no anti-cheat certification or no-ban guarantee is claimed.
