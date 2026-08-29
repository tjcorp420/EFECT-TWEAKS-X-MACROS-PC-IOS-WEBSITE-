const test = require("node:test");
const assert = require("node:assert/strict");
const admin = require("../api/affiliate-admin");

function memoryDb(seed = {}) {
  const root = structuredClone(seed);
  const parts = value => String(value || "").split("/").filter(Boolean);
  const get = value => parts(value).reduce((node, key) => node?.[key], root);
  const put = (value, next) => {
    const keys = parts(value);
    let node = root;
    keys.slice(0, -1).forEach(key => { node = node[key] || (node[key] = {}); });
    if (next === null) delete node[keys.at(-1)];
    else node[keys.at(-1)] = structuredClone(next);
  };
  const snapshot = (value, key = "") => ({
    key,
    val: () => structuredClone(value),
    forEach: callback => Object.entries(value || {}).forEach(([childKey, child]) => callback(snapshot(child, childKey))),
  });
  const ref = value => ({
    once: async () => snapshot(get(value), parts(value).at(-1)),
    set: async next => put(value, next),
    update: async updates => {
      if (value) put(value, { ...(get(value) || {}), ...structuredClone(updates) });
      else Object.entries(updates).forEach(([key, next]) => put(key, next));
    },
    transaction: async callback => {
      const current = get(value);
      const next = callback(structuredClone(current));
      if (next === undefined) return { committed: false, snapshot: snapshot(current) };
      put(value, next);
      return { committed: true, snapshot: snapshot(next) };
    },
  });
  return { ref, root };
}

test("creating the isolated diagnostic affiliate preserves every real affiliate", async () => {
  const real = {
    id: "real-account",
    displayName: "Real Creator",
    code: "real-creator",
    emailHash: "real-email-hash",
    emailMasked: "re**@example.com",
    password: { hash: "unchanged" },
    status: "active",
    stats: { conversions: 3 },
    createdAt: "2026-08-29T00:00:00.000Z",
  };
  const db = memoryDb({
    affiliateProgram: {
      affiliates: { "real-account": real },
      indexByCode: { "real-creator": "real-account" },
      indexByEmail: { "real-email-hash": "real-account" },
    },
  });

  const diagnostic = await admin.createTestAffiliate(db);
  assert.deepEqual(db.root.affiliateProgram.affiliates["real-account"], real);
  assert.equal(Object.keys(db.root.affiliateProgram.affiliates).length, 2);
  assert.equal(diagnostic.isTest, true);
  assert.match(diagnostic.code, /^emx-test-/);

  const reused = await admin.createTestAffiliate(db);
  assert.equal(reused.id, diagnostic.id);
  assert.equal(Object.keys(db.root.affiliateProgram.affiliates).length, 2);
});

test("diagnostic cleanup rejects every normal affiliate record", () => {
  assert.throws(
    () => admin.assertDisposableTestAffiliate({
      id: "real-account",
      displayName: "Real Creator",
      code: "real-creator",
      isTest: false,
    }),
    /Safety stop/,
  );
});
