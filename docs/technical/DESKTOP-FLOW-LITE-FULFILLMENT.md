# Desktop Flow Lite fulfillment

Desktop Flow Lite is sold through Payhip product `t2qKl` and receives the
`EMX_DESKTOP_FLOW_LITE` entitlement. It intentionally does not share keys,
devices, or license records with the full Desktop Flow product.

## Boundaries

- Payhip URL: `https://payhip.com/b/t2qKl`
- Public price: `$14.99`
- App product id: `emx-desktop-flow-lite`
- Key format: `EMXDFL-XXXXXXXX-XXXXXXXX-XXXXXXXX`
- Worker: `emx-desktop-flow-lite-auth`
- D1 database: `emx_desktop_flow_lite_auth`
- Device limit: one Windows PC

The Payhip webhook generates a product-specific Lite key, persists the receipt
and entitlement in the existing fulfillment store, synchronizes the hashed key
to the isolated Lite Worker, and only then completes fulfillment. A missing or
failed Lite sync raises an error so Payhip can retry instead of delivering a key
that cannot activate.

## Production configuration

The Worker and the storefront must receive the same random secret through their
respective secret stores. Never commit the value.

- Worker secret: `EMX_LICENSE_SYNC_SECRET`
- Storefront environment variable: `EMX_DESKTOP_FLOW_LITE_SYNC_SECRET`
- Optional storefront endpoint override: `EMX_DESKTOP_FLOW_LITE_LICENSE_SYNC_URL`

The default endpoint is
`https://emx-desktop-flow-lite-auth.tjcorp420.workers.dev`.

## Release verification

1. Confirm `/health` returns `emx-desktop-flow-lite`.
2. Complete a Payhip checkout with a single-use 100%-off coupon and a controlled
   test email.
3. Confirm the receipt maps to `EMX_DESKTOP_FLOW_LITE` and the delivered key
   starts with `EMXDFL-`.
4. Activate the packaged Lite app, quit it, and restart it.
5. Confirm a full Desktop Flow key is rejected by Lite and the Lite key is
   rejected by the full app.
6. Confirm the one-device limit with a second controlled Windows device or VM.
7. Disable or delete the temporary coupon after the test.

Do not claim the live purchase path is verified until the real Payhip webhook,
email delivery, Worker write, packaged activation, restart, and cross-product
rejection checks have all been observed.
