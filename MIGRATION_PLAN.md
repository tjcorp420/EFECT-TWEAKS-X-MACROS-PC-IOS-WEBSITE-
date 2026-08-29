# Migration Plan

The new model is additive and reads legacy affiliate records.

1. Deploy code with existing Firebase/KV/Blob/Payhip environment values unchanged.
2. Verify `/api/products`, `/api/site-settings`, affiliate login, and Payhip webhook health.
3. Existing `approved` affiliates behave as active; existing `disabled` affiliates display as suspended. Update records through Affiliate Command as they are reviewed.
4. Existing catalog entries are normalized with safe delivery, publishing, and intro defaults. Review each item in Product Control before saving live.
5. Use the marked test-affiliate flow and a real free download to populate and verify the new event/conversion branches.
6. Keep Payhip paid delivery in place. Move only free/public packages to direct Blob delivery.
7. The legacy `/api/referrals` wrapper is retired; historical conversion and payout records remain untouched.

Rollback is code-only: the checked-in catalog remains a public fallback, and the existing provider data is not destructively migrated.
