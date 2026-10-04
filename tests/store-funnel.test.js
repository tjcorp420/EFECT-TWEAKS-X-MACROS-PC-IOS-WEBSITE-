const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeEvent,
  recordStoreEvent,
} = require("../api/_lib/store-funnel");
const products = [{ id: "volt" }, { id: "hidden", visible: false }];
const input = {
  type: "product_view",
  sessionId: "session-example-123",
  productId: "volt",
  page: "/products.html",
};
test("store events reject invalid products, injected paths, invalid sessions and financial events", () => {
  assert.ok(normalizeEvent(input, products));
  for (const patch of [
    { productId: "hidden" },
    { productId: "unknown" },
    { sessionId: "x" },
    { page: "//evil.example" },
    { type: "purchase" },
    { type: "checkout_open", productId: "store" },
  ])
    assert.equal(normalizeEvent({ ...input, ...patch }, products), null);
  assert.equal(
    normalizeEvent({ ...input, page: "/products.html?email=private" }, products)
      .page,
    "/products.html",
  );
});
test("store event transaction deduplicates and keeps raw identifiers out of storage", async () => {
  let value;
  const db = {
    ref: () => ({
      transaction: async (fn) => {
        const next = fn(value);
        if (next === undefined) return { committed: false };
        value = next;
        return { committed: true };
      },
    }),
  };
  const event = normalizeEvent(input, products);
  assert.equal((await recordStoreEvent(db, event, "2026-09-30")).tracked, true);
  assert.equal(
    (await recordStoreEvent(db, event, "2026-09-30")).tracked,
    false,
  );
  assert.equal(value.counts.product_view, 1);
  assert.equal(value.products.volt.product_view, 1);
  assert.ok(!JSON.stringify(value).includes(input.sessionId));
  await recordStoreEvent(db, { ...event, type: "checkout_open" }, "2026-09-30");
  assert.equal(value.counts.checkout_open, 1);
});
