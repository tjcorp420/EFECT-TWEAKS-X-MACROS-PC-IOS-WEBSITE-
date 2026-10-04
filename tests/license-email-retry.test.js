const test = require("node:test");
const assert = require("node:assert/strict");

const {
  hashEmail,
  resendLicenseEmailByReceipt,
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

function fakeOrderDb(order) {
  const updates = [];
  return {
    updates,
    ref() {
      return {
        async once() {
          return { val: () => order };
        },
        async update(value) {
          updates.push(value);
        }
      };
    }
  };
}

test("resends only to the verified receipt email without returning the key", async () => {
  const email = "buyer@example.com";
  const db = fakeOrderDb({
    emailHash: hashEmail(email),
    licenseKey: "EMXDFL-AAAAA-BBBBB-CCCCC-DDDDD",
    licenseKeys: {
      EMX_DESKTOP_FLOW_LITE: "EMXDFL-AAAAA-BBBBB-CCCCC-DDDDD"
    },
    products: { EMX_DESKTOP_FLOW_LITE: { enabled: true } },
    emailDelivery: { status: "sent" }
  });
  let sent;
  const result = await resendLicenseEmailByReceipt(email, "ORDER-123", {
    db,
    nowMs: Date.parse("2026-09-29T01:00:00.000Z"),
    async sendEmail(destination, details) {
      sent = { destination, details };
      return { status: "sent", provider: "test", id: "message-1" };
    }
  });

  assert.deepEqual(result, { status: "sent", provider: "test" });
  assert.equal(sent.destination, email);
  assert.equal(sent.details.productIds[0], "EMX_DESKTOP_FLOW_LITE");
  assert.match(sent.details.deliveryAttempt, /^resend-/);
  assert.equal(Object.hasOwn(result, "licenseKey"), false);
  assert.equal(db.updates.length, 1);
  assert.equal(db.updates[0].emailDelivery.status, "sent");
});

test("rate limits repeated receipt email resends", async () => {
  const email = "buyer@example.com";
  const db = fakeOrderDb({
    emailHash: hashEmail(email),
    licenseKey: "EMXDFL-AAAAA-BBBBB-CCCCC-DDDDD",
    products: { EMX_DESKTOP_FLOW_LITE: { enabled: true } },
    emailDelivery: {
      status: "sent",
      lastResendAt: "2026-09-29T01:00:00.000Z"
    }
  });
  let sends = 0;
  const result = await resendLicenseEmailByReceipt(email, "ORDER-123", {
    db,
    nowMs: Date.parse("2026-09-29T01:01:00.000Z"),
    async sendEmail() {
      sends += 1;
      return { status: "sent" };
    }
  });

  assert.equal(result.status, "cooldown");
  assert.equal(result.retryAfterSeconds, 240);
  assert.equal(sends, 0);
  assert.equal(db.updates.length, 0);
});
