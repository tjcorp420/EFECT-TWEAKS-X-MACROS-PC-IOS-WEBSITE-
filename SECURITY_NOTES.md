# Security Notes

- Secrets stay in environment variables; none are committed or returned to browsers.
- Affiliate passwords use salted `scrypt`, login throttling, HTTP-only same-site cookies, and bounded sessions.
- Admin writes require a constant-time `ADMIN_PASSWORD` check.
- Same-origin checks protect public tracking and download preparation endpoints.
- Event identity is privacy-safe and deduplicated; raw IP storage and invasive fingerprinting are intentionally excluded.
- Payhip signatures remain the source of truth for paid conversions; client clicks can never create paid revenue.
- Uploaded product files are extension-, size-, content-type-, and magic-signature constrained.
- Public Blob delivery is not paid entitlement protection. Do not assign a paid product to `direct` delivery until a private entitlement service exists.
- Run `npm audit` regularly. Do not apply forced dependency upgrades without compatibility review.
