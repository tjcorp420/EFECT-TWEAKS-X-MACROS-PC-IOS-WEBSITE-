# Product Delivery Architecture

Each catalog item declares `deliveryType`: `payhip`, `direct`, `external`, or `coming-soon`.

- `payhip`: paid checkout and license delivery remain handled by Payhip.
- `direct`: the download URL is resolved through `/api/download`; free referred downloads create real zero-dollar conversions.
- `external`: the same download preparation route records analytics and then returns the allow-listed HTTPS destination.
- `coming-soon`: no actionable delivery control is rendered.

Product Control uploads ZIP, EXE, MSI, and 7Z packages directly from the authorized browser to Vercel Blob. Client-side magic-byte checks prevent obvious mismatches before upload; the Blob completion callback independently range-reads and checks the uploaded signature, deleting mismatches. MIME alone is never treated as proof of file type.

Current direct Blob URLs are public. They are suitable for free tools and public packages, not paid entitlement protection. Paid packages must continue through Payhip until an authenticated license entitlement and private/signed download service is implemented.
