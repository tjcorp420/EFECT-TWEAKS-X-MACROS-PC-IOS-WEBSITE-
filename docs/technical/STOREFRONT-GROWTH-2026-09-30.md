# Homepage and funnel refresh — September 30, 2026

The home route now leads with Windows software, two primary actions, real app screenshots, three catalog-driven featured products, and the current bundle. Existing Hub, Discord, maps, services, and network destinations remain in a secondary disclosure; free-tool routes and modal behavior remain supported.

The supplied six-second brand intro has its audio track removed and automatically plays in a fullscreen entrance before the shop. Skip, Escape, completion, video errors, and a ten-second loading timeout restore the shop. Blocked autoplay exposes a Play button. Internal navigation, anchor destinations, and reduced-motion preferences skip the entrance. The intro is not duplicated inside the shop.

All five original gameplay clips are published as muted H.264 web copies with fast-start metadata, individual posters, native controls, and preload=none; source files are untouched. Gameplay is not represented as a measured benchmark or anti-cheat certification. The three September 30 screen recordings are design references only and are not published. Shared navigation includes a Hub link that expands the retained Hub disclosure, preserving download, login, Discord, copy username, maps, services, network, About, and free-tool access. The wider home layout includes responsive gameplay cards and setup FAQs.

## October 1 media update
October 1 media update: the first supplied video replaces the fullscreen entrance as store-intro-oct01.mp4. The second is store-header-oct01.mp4, a looping banner immediately below navigation. Both web copies contain only the primary video stream and no audio; originals remain untouched. The header starts after entrance dismissal, includes a play/pause button, and defaults to its poster for reduced-motion visitors. Gameplay player exclusivity excludes this decorative header so it cannot interrupt the intro or gameplay.

## Analytics
store-analytics.js sends page_view, product_view, and checkout_open to /api/affiliate-track?store=1 independently of affiliate tracking. Events are deduplicated per random session, product, type, and UTC day. Only approved public product IDs and known storefront paths are accepted. No revenue, email, license keys, raw session identifiers, or URL query strings are stored. Browser Do Not Track and Global Privacy Control disable these events.

Atomic daily Firebase transactions hold aggregate counts and daily hashed deduplication tokens under storeFunnel/daily. A bucket is bounded at 20,000 unique events/day. This limits growth but is not bot detection; counts represent tracked sessions, not verified people. Retention is currently indefinite and disclosed in privacy.html. Browser sessions blocked by tracking preferences are excluded.

The private report is /store-funnel.html (no public navigation, noindex). Use the existing store admin password. GET /api/affiliate-track?store=1 requires the existing x-admin-password credential and returns the latest 30 recorded days of aggregate counters and product breakdowns; it never returns deduplication hashes. Passwords are cleared after requests and never stored. A 401/503 report state is visible and retryable.

Counts start at deployment; purchases and revenue are still authoritative in Payhip. Exclude the owner-identified free/test orders when assessing paid sales. This pass does not infer purchases from checkout opens.

## Verification
npm run check
npm test
npm run build
Serve static UI with python -m http.server 8088; static serving intentionally cannot execute Vercel APIs. Verify the homepage, free modal/close focus, product routes, responsive layout, video playback, and authenticated analytics independently in production.
