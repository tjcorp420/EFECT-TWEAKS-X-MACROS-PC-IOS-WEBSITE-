const test = require("node:test");
const assert = require("node:assert/strict");

const originalFetch = global.fetch;
const originalKvUrl = process.env.KV_REST_API_URL;
const originalKvToken = process.env.KV_REST_API_TOKEN;

test.after(() => {
  global.fetch = originalFetch;
  if (originalKvUrl === undefined) delete process.env.KV_REST_API_URL;
  else process.env.KV_REST_API_URL = originalKvUrl;
  if (originalKvToken === undefined) delete process.env.KV_REST_API_TOKEN;
  else process.env.KV_REST_API_TOKEN = originalKvToken;
});

test("catalog removes retired database rows and restores the canonical current bundle", async () => {
  process.env.KV_REST_API_URL = "https://kv.example";
  process.env.KV_REST_API_TOKEN = "test-token";

  const staleProducts = [
    {
      id: "optimizer",
      key: "KQLzN",
      title: "EMX Ultimate Tweak Utility",
      visible: true,
      productUrl: "https://payhip.com/b/KQLzN"
    },
    {
      id: "os_macro_bundle",
      key: "By7FV",
      title: "EMX Custom OS + KBM Macro Bundle",
      description: "Old bundle copy",
      bundleItems: ["custom_os", "macro"],
      visible: true
    },
    {
      id: "custom_os",
      key: "Isg28",
      title: "EMX Custom OS",
      image: "./assets/emx-os/emx-payhip-overview.png",
      gallery: ["./assets/emx-os/emx-payhip-overview.png"],
      version: "v1.3.20",
      visible: true
    },
    {
      id: "windows_tweak_dashboard",
      key: "TJFav",
      title: "EMX Windows Tweak Dashboard",
      version: "v0.3.0",
      visible: true
    },
    {
      id: "volt",
      key: "Oqz73",
      title: "EMX VOLT MACRO",
      version: "v0.1.71",
      visible: true
    },
    {
      id: "fps",
      key: "EQIrd",
      title: "EMX FPS Booster",
      version: "v1.0.23",
      visible: true
    },
    {
      id: "clips",
      key: "8vBPZ",
      productUrl: "https://payhip.com/b/8vBPZ",
      price: 1,
      version: "Old catalog release",
      licenseType: "Paid access",
      deliveryType: "payhip",
      visible: true
    }
  ];

  global.fetch = async () => ({
    ok: true,
    text: async () => JSON.stringify({ result: JSON.stringify(staleProducts) })
  });

  const { loadProducts } = require("../api/products");
  const products = await loadProducts();
  const ids = products.map(product => product.id);
  const bundle = products.find(product => product.id === "os_macro_bundle");
  const customOs = products.find(product => product.id === "custom_os");
  const dashboard = products.find(product => product.id === "windows_tweak_dashboard");
  const clips = products.find(product => product.id === "clips");
  const volt = products.find(product => product.id === "volt");
  const fps = products.find(product => product.id === "fps");

  assert.ok(!ids.includes("optimizer"));
  assert.equal(
    bundle.title,
    "EMX Windows Tweak Dashboard and EMX VOLT Macro Ultimate Bundle"
  );
  assert.deepEqual(bundle.bundleItems, ["windows_tweak_dashboard", "volt"]);
  assert.match(bundle.description, /Windows Tweak Dashboard and EMX VOLT MACRO/);
  assert.equal(customOs.image, "./assets/emx-os/emx-custom-os-overview.png");
  assert.equal(customOs.gallery.length, 8);
  assert.equal(customOs.version, "v1.3.21");
  assert.equal(dashboard.version, "v0.3.1");
  assert.equal(clips.price, 0);
  assert.equal(clips.key, "");
  assert.equal(clips.version, "v1.9.4");
  assert.equal(clips.deliveryType, "external");
  assert.equal(clips.deliveryUrl, "https://clips.emxtweaks.com/");
  assert.match(clips.licenseType, /Free download/);
  assert.equal(volt.version, "v0.1.72");
  assert.equal(fps.version, "v1.0.24");
});
