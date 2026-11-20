// Browser test (Chromium through Playwright): the status pill of the header is placed from the card's first frame,
// with Home Assistant's <ha-card> drawing its content a microtask late. Needs the built bundle (npm run test:browser).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const cardJs = readFileSync(fileURLToPath(new URL("../../dist/home-camera-card.js", import.meta.url)), "utf8");
const stubs = `
customElements.define("ha-icon", class extends HTMLElement {});
customElements.define("ha-camera-stream", class extends HTMLElement {
  static elementProperties = new Map([["hass", {}]]);
  get stateObj() { return this._obj; }
  set stateObj(v) { this._obj = v; }
  get updateComplete() { return Promise.resolve(true); }
});
customElements.define("ha-web-rtc-player", class extends HTMLElement {
  get updateComplete() { return Promise.resolve(true); }
});`;
const st = (id, state) => [id, { entity_id: id, state, attributes: { supported_features: 2, friendly_name: id } }];
const HASS = () => ({
  states: Object.fromEntries(
    [["camera.a_hd_stream", "idle"], ["camera.a_sd_stream", "idle"], ["camera.b_hd_stream", "idle"], ["camera.c", "idle"], ["switch.b_privacy", "off"]].map(([i, s]) => st(i, s)),
  ),
  entities: {
    "camera.b_hd_stream": { entity_id: "camera.b_hd_stream", device_id: "b" },
    "switch.b_privacy": { entity_id: "switch.b_privacy", device_id: "b" },
  },
  language: "en",
  locale: { language: "en" },
});
const cameras = ["camera.a_hd_stream", "camera.b_hd_stream", "camera.c"];

let browser;
let skip = false;
before(async () => {
  try {
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  } catch (err) {
    if (process.env.CI) throw err;
    skip = `Chromium not available: ${err.message.split("\n")[0]}`;
  }
});
after(() => browser?.close());

// Home Assistant's <ha-card> is a Lit element: it shows its content from its first update only, a microtask after it is
// connected, so whatever the card measures before that is 0 px wide. With such a stand-in, the status pill must be in
// its place (and the card at its height) from the first frame, and keep them through state updates.
const LIT_HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;overflow:hidden}</style>"; }
  connectedCallback() {
    if (this.updateComplete) return;
    this.hasUpdated = false;
    this.updateComplete = Promise.resolve().then(() => { this.shadowRoot.appendChild(document.createElement("slot")); this.hasUpdated = true; return true; });
  }
});`;

for (const [type, config] of ["home-camera-card", "home-camera-mini-card"].flatMap((type) => [{ cameras }, { cameras, title: "Cameras of the house and the garden" }, { cameras, illustration: false }].map((c) => [type, c])))
  for (const width of [300, 400])
    test(`${type}${config.title ? " (long title)" : config.illustration === false ? " (classic header)" : ""} at ${width} px in a Lit-like ha-card: the pill is placed from the first frame and stays`, async (t) => {
      if (skip) return t.skip(skip);
      const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setContent("<!doctype html><body style='margin:0'></body>");
      await page.addScriptTag({ content: LIT_HA_CARD + stubs });
      await page.addScriptTag({ content: cardJs });
      const r = await page.evaluate(
        async ({ type, config, width, hass }) => {
          const frame = () => new Promise((done) => requestAnimationFrame(done));
          const box = document.createElement("div");
          box.style.width = `${width}px`;
          document.body.appendChild(box);
          const el = document.createElement(type);
          el.setConfig({ type: `custom:${type}`, ...config });
          el.hass = hass;
          box.appendChild(el);
          const look = () => `${Math.round(el.getBoundingClientRect().height)} ${[...el.shadowRoot.querySelectorAll(".head .titles")].map((n) => n.className).join("|")}`;
          const first = new Set();
          for (let k = 0; k < 6; k++) {
            await frame();
            first.add(look());
          }
          await new Promise((done) => setTimeout(done, 300));
          await frame();
          const settled = look();
          const updates = new Set();
          let h = hass;
          for (let i = 1; i <= 8; i++) {
            const states = { ...h.states };
            if (i % 2) states["sensor.layout_probe"] = { entity_id: "sensor.layout_probe", state: String(i), attributes: {} };
            else {
              states["camera.c"] = { ...states["camera.c"], attributes: { ...states["camera.c"].attributes, access_token: `t${i}` } };

            }
            h = { ...h, states };
            el.hass = h;
            await frame();
            await frame();
            updates.add(look());
          }
          return { first: [...first], settled, updates: [...updates] };
        },
        { type, config, width, hass: HASS() },
      );
      await page.close();
      assert.deepEqual(errors, []);
      assert.deepEqual(r.first, [r.settled], "the first frames show the pill where it settles, at the same height");
      assert.deepEqual(r.updates, [r.settled], "state updates keep the pill's place and the height");
    });
