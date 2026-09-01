const test = require("node:test");
const assert = require("node:assert/strict");

const {
  shouldRetryLicenseEmail
} = require("../api/_lib/license-automation");

test("retries delivery for an order whose previous email failed", () => {
  assert.equal(
    shouldRetryLicenseEmail({ emailDelivery: { status: "failed" } }),
    true
  );
});

test("does not duplicate an email that was already sent", () => {
  assert.equal(
    shouldRetryLicenseEmail({ emailDelivery: { status: "sent" } }),
    false
  );
});

test("retries legacy orders without delivery metadata", () => {
  assert.equal(shouldRetryLicenseEmail({ processed: true }), true);
});
