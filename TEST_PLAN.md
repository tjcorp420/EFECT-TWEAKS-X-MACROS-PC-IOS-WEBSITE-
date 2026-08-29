# Test Plan

Automated checks:

- `npm test`: input normalization, credential comparison, webhook/refund behavior, event deduplication, inactive-account rejection, and the real `$0` free-download conversion invariant.
- `npm run check`: static asset/link/script validation and JavaScript syntax checks.
- `npm run build`: browser upload bundle generation plus production site build.

Manual production checks requiring configured services:

1. Create an Affiliate Command test account.
2. Open its `/r/:code` URL in a clean browser session.
3. View a product and download the free Window Deck package.
4. Confirm one visit, product view, and one `free_download` conversion with zero revenue.
5. Repeat the download and confirm no duplicate conversion.
6. Verify status suspension prevents subsequent attribution.
7. Upload each supported package type in Product Control and verify progress, signature rejection, delivery fields, and saved catalog persistence.
8. Complete a Payhip sandbox/test transaction only when Payhip supports a non-billable operator test; otherwise use webhook fixtures and do not fabricate a sale.

Visual checks cover 1440px desktop, 1280px laptop, 768px tablet, and 390px mobile, including reduced motion and keyboard navigation.
