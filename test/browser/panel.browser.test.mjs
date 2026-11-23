// Runs the built panel in Chromium with the built card and stand-ins for Home Assistant's elements and connection:
// the Cameras tab for every user, the Settings tab for administrators only, saving and copying from a dashboard.
// Usage: npm run test:browser (CHROMIUM_PATH=... to use an installed Chromium)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const dist = (f) => readFileSync(fileURLToPath(new URL(`../../dist/${f}`, import.meta.url)), "utf8");
const cardJs = dist("home-camera-card.js");
const panelJs = dist("home-camera-panel.js");

const stubs = `
for (const tag of ["ha-card", "ha-icon", "ha-menu-button", "ha-circular-progress"]) customElements.define(tag, class extends HTMLElement {});
customElements.define("ha-camera-stream", class extends HTMLElement { static elementProperties = new Map([["hass", {}]]); });
// ha-form: keeps what it is given; window.formChange(value) plays a change made in the form.
customElements.define("ha-form", class extends HTMLElement {
  connectedCallback() { window.form = this; }
});
window.formChange = (value) => form.dispatchEvent(new CustomEvent("value-changed", { detail: { value } }));
window.sent = [];
window.makeHass = ({ admin, card, title = "", hide = "never" }) => {
  const listeners = [];
  window.push = (data) => listeners.forEach((cb) => cb(data));
  const settings = (c, t, h = hide) => ({ configured: true, card: c, title: t, hide_toolbar: h, sidebar_title: t || "Cameras", default_title: "Cameras" });
  return {
    language: "en",
    user: { is_admin: admin },
    states: { "camera.a": { entity_id: "camera.a", state: "idle", attributes: {} }, "camera.b": { entity_id: "camera.b", state: "idle", attributes: {} } },
    entities: {},
    callService: () => {},
    connection: {
      subscribeMessage: (cb, msg) => {
        sent.push(msg);
        listeners.push(cb);
        setTimeout(() => cb(settings(card, title)));
        return Promise.resolve(() => {});
      },
    },
    callWS: async (msg) => {
      sent.push(msg);
      if (msg.type === "home_camera/update_settings") return settings(msg.card, msg.title, msg.hide_toolbar);
      if (msg.type === "home_camera/discover") {
        return {
          cameras: [
            { camera: "camera.a", name: "Living room", area: "Living room", sd: null },
            { camera: "camera.b_hd_stream", name: "Kids", area: "Bedroom", sd: "camera.b_sd_stream" },
            { camera: "camera.c_hd_stream", name: "Office", area: null, sd: "camera.c_sd_stream" },
            {
              camera: "camera.d",
              name: "Terrace",
              area: null,
              sd: null,
              privacy: "switch.d_mode_prive",
              ptz: { left: "button.d_gauche" },
              motion: ["binary_sensor.d_mouvement"],
            },
          ],
        };
      }
      if (msg.type === "lovelace/dashboards/list") return [{ url_path: "dashboard-cameras", title: "Cameras", mode: "storage" }];
      if (msg.type === "lovelace/config" && msg.url_path === "dashboard-cameras") {
        return { views: [{ sections: [{ cards: [{ type: "custom:home-camera-card", cameras: ["camera.b"], grid_options: { columns: 36 } }] }] }] };
      }
      return { views: [] };
    },
  };
};
window.open = async (opts, path = "") => {
  document.body.replaceChildren();
  sent.length = 0;
  const el = document.createElement("home-camera-panel");
  el.panel = { url_path: "cameras", config: opts.panelConfig || {} };
  el.route = { path };
  document.body.appendChild(el);
  el.hass = makeHass(opts);
  window.panel = el;
  await new Promise((r) => setTimeout(r, 50));
  return el;
};
window.$ = (sel) => panel.shadowRoot.querySelector(sel);
// The cameras as the Settings tab edits them (camera ids), and the rows of its list
window.camIds = () => (panel._formValues().card.cameras || []).map((c) => (typeof c === "string" ? c : c.camera));
window.rows = () => [...panel.shadowRoot.querySelectorAll("[data-shown] [data-row] .who .n")].map((n) => n.textContent);
window.tabs = () => [...panel.shadowRoot.querySelectorAll(".tab")].map((t) => t.dataset.tab);
`;

let browser;
let page;

before(async () => {
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addScriptTag({ content: stubs });
  await page.addScriptTag({ content: cardJs });
  await page.addScriptTag({ content: panelJs });
});

after(async () => {
  await browser?.close();
});

test("every user gets the cameras full page, without the Settings tab", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: false, card: { cameras: ["camera.a", "camera.b"] } });
    const card = $("#tab-cameras hc-camera-wall");
    return {
      subscribed: sent.some((m) => m.type === "home_camera/subscribe"),
      tabs: tabs(),
      tabsHidden: $(".tabs").hidden,
      settingsLink: !!$(".toolbar a"),
      tiles: card?.shadowRoot.querySelectorAll(".tile").length,
      wall: card?.hasAttribute("wall"),
      // The panel draws its own wall: no dashboard card in the page, no <ha-card> around the grid.
      cards: $("#tab-cameras").querySelectorAll("home-camera-card, home-camera-mini-card").length,
      haCard: !!card?.shadowRoot.querySelector("ha-card"),
      head: card?.shadowRoot.querySelector(".head")?.childElementCount ?? 0,
    };
  });
  assert.deepEqual(r, { subscribed: true, tabs: ["cameras"], tabsHidden: true, settingsLink: false, tiles: 2, wall: true, cards: 0, haCard: false, head: 0 });
});

test("a user cannot open Settings from the address", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: false, card: { cameras: ["camera.a"] } }, "settings");
    return { cameras: !$("#tab-cameras").hidden, settings: !$("#tab-settings").hidden };
  });
  assert.deepEqual(r, { cameras: true, settings: false });
});

test("no camera yet: a user is told an administrator chooses them, an administrator gets a button", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: false, card: { cameras: [] } });
    const user = $("#tab-cameras .note").textContent;
    await open({ admin: true, card: { cameras: [] } });
    $("[data-choose]").click();
    return { user, adminTabs: tabs(), now: !$("#tab-settings").hidden };
  });
  assert.match(r.user, /an administrator chooses them/);
  assert.deepEqual(r.adminTabs, ["cameras", "settings"]);
  assert.equal(r.now, true);
});

test("new settings pushed by the server redraw the card, the same ones never do", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: false, card: { cameras: ["camera.a"] } });
    const card = $("#tab-cameras hc-camera-wall");
    const tile = card.shadowRoot.querySelector(".tile");
    const settings = (c) => ({ configured: true, card: c, title: "", sidebar_title: "Cameras", default_title: "Cameras" });
    push(settings({ cameras: ["camera.a"] }));
    const kept = card.shadowRoot.querySelector(".tile") === tile;
    push(settings({ cameras: ["camera.a", "camera.b"] }));
    return { kept, same: $("#tab-cameras hc-camera-wall") === card, tiles: card.shadowRoot.querySelectorAll(".tile").length };
  });
  assert.deepEqual(r, { kept: true, same: true, tiles: 2 });
});

test("an administrator edits a camera and the title in Settings, then saves them", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: true, card: { cameras: ["camera.a"] } }, "settings");
    const before = { save: $("[data-save]").disabled, rows: rows(), pill: $("[data-banner] .stpill").textContent.trim() };
    $('[data-edit="0"]').click();
    await new Promise((r) => setTimeout(r, 20));
    const editor = $("[data-cam-editor] home-camera-card-editor");
    const opened = { section: editor?.section, data: form.data, expanded: $('[data-edit="0"]').getAttribute("aria-expanded") };
    formChange({ camera: "camera.a", name: "Garden" });
    const input = $("[data-title]");
    input.value = "Surveillance";
    input.dispatchEvent(new Event("input"));
    const dirty = { save: $("[data-save]").disabled, msg: $("[data-msg]").textContent, rows: rows(), pill: $("[data-banner] .stpill").textContent.trim(), same: $("[data-cam-editor] home-camera-card-editor") === editor };
    $("[data-save]").click();
    await new Promise((r) => setTimeout(r, 50));
    return { before, opened, dirty, saved: sent.find((m) => m.type === "home_camera/update_settings"), msg: $("[data-msg]").textContent, toolbar: $(".toolbar .grow").textContent };
  });
  assert.deepEqual(r.before, { save: true, rows: ["camera.a"], pill: "Up to date" });
  assert.deepEqual(r.opened, { section: "camera", data: { camera: "camera.a" }, expanded: "true" });
  assert.deepEqual(r.dirty, { save: false, msg: "Unsaved changes", rows: ["Garden"], pill: "Unsaved changes", same: true });
  assert.deepEqual(r.saved, {
    type: "home_camera/update_settings",
    card: { cameras: [{ camera: "camera.a", name: "Garden" }] },
    title: "Surveillance",
    hide_toolbar: "never",
  });
  assert.equal(r.msg, "Saved");
  assert.equal(r.toolbar, "Surveillance");
});

test("the cameras shown are reordered with the arrow keys on their handle, and removed from their fields", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: true, card: { cameras: ["camera.a", "camera.b"] } }, "settings");
    $('[data-move="0"]').dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, composed: true }));
    const moved = { ids: camIds(), focus: panel.shadowRoot.activeElement?.dataset.move, save: $("[data-save]").disabled };
    $('[data-edit="0"]').click();
    await new Promise((r) => setTimeout(r, 20));
    $('[data-remove="0"]').click();
    await new Promise((r) => setTimeout(r, 20));
    return { moved, removed: camIds(), head: $("[data-shown-head]").textContent };
  });
  assert.deepEqual(r.moved, { ids: ["camera.b", "camera.a"], focus: "1", save: false });
  assert.deepEqual(r.removed, ["camera.a"]);
  assert.equal(r.head, "Cameras shown · 1");
});

test("Copy from a dashboard takes the first camera card, without its type or layout", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: true, card: { cameras: [] } }, "settings");
    $("[data-import]").click();
    await new Promise((r) => setTimeout(r, 50));
    return { msg: $("[data-msg]").textContent, data: camIds(), rows: rows(), save: $("[data-save]").disabled };
  });
  assert.match(r.msg, /copied from “Cameras”/);
  assert.deepEqual(r.data, ["camera.b"]);
  assert.deepEqual(r.rows, ["camera.b"]);
  assert.equal(r.save, false);
});

test("Settings lists the cameras found that the panel does not show yet, and adds them", async () => {
  const r = await page.evaluate(async () => {
    // camera.a is shown; Office is listed through its SD stream
    await open({ admin: true, card: { cameras: ["camera.a", { camera: "camera.x", sd: "camera.c_sd_stream" }] } }, "settings");
    const names = () => [...panel.shadowRoot.querySelectorAll(".found .n")].map((n) => n.textContent);
    const first = { names: names(), sub: $(".found .s").textContent, addAll: !!$('[data-add=""]') };
    $('[data-add="camera.d"]').click();
    await new Promise((r) => setTimeout(r));
    const one = { names: names(), cameras: camIds(), save: $("[data-save]").disabled };
    $('[data-add="camera.b_hd_stream"]').click();
    await new Promise((r) => setTimeout(r));
    return { first, one, all: { names: names(), msg: $("[data-msg]").textContent, none: $("[data-found] .msg").textContent }, cameras: panel._formValues().card.cameras };
  });
  assert.deepEqual(r.first, { names: ["Kids", "Terrace"], sub: "Bedroom · camera.b_hd_stream · HD + SD", addAll: true });
  assert.deepEqual(r.one, { names: ["Kids"], cameras: ["camera.a", "camera.x", "camera.d"], save: false });
  assert.deepEqual(r.all, { names: [], msg: "Cameras added: 1. Save to keep them.", none: "Every camera found is already in the panel." });
  assert.deepEqual(r.cameras.at(-1), { camera: "camera.b_hd_stream", name: "Kids" });
  assert.deepEqual(r.cameras.at(-2), {
    camera: "camera.d",
    name: "Terrace",
    privacy: "switch.d_mode_prive",
    ptz: { left: "button.d_gauche" },
    motion: "binary_sensor.d_mouvement",
  });
});

test("Add all takes every camera found at once", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: true, card: { cameras: [] } }, "settings");
    $('[data-add=""]').click();
    await new Promise((r) => setTimeout(r));
    return { cameras: camIds(), msg: $("[data-msg]").textContent };
  });
  assert.deepEqual(r.cameras, ["camera.a", "camera.b_hd_stream", "camera.c_hd_stream", "camera.d"]);
  assert.equal(r.msg, "Cameras added: 4. Save to keep them.");
});

test("on the wall, the column count is empty by default and 2 is kept when chosen", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: true, card: { cameras: ["camera.a", "camera.b"] } }, "settings");
    const before = form.data.columns;
    formChange({ cameras: [{ camera: "camera.a" }, { camera: "camera.b" }], columns: 2 });
    $("[data-save]").click();
    await new Promise((r) => setTimeout(r, 50));
    const saved = sent.find((m) => m.type === "home_camera/update_settings").card;
    const grid = $("#tab-cameras hc-camera-wall").shadowRoot.querySelector(".grid").style.gridTemplateColumns;
    return { before, saved, grid };
  });
  assert.equal(r.before, undefined);
  assert.deepEqual(r.saved, { cameras: ["camera.a", "camera.b"], columns: 2 });
  assert.equal(r.grid, "repeat(2, minmax(0px, 1fr))");
});

test("the top bar hidden for non-admins: a user gets the wall alone, an administrator keeps the bar", async () => {
  const r = await page.evaluate(async () => {
    const shown = (sel) => getComputedStyle($(sel)).display !== "none";
    await open({ admin: false, hide: "users", card: { cameras: ["camera.a"] } });
    const user = { bare: panel.hasAttribute("bare"), bar: shown(".toolbar"), fab: !!$("[data-fab]") };
    await open({ admin: true, hide: "users", card: { cameras: ["camera.a"] } });
    return { user, admin: { bare: panel.hasAttribute("bare"), bar: shown(".toolbar") } };
  });
  assert.deepEqual(r, { user: { bare: true, bar: false, fab: false }, admin: { bare: false, bar: true } });
});

test("the top bar hidden for everyone: the title bar goes on both tabs, the tabs stay", async () => {
  const r = await page.evaluate(async () => {
    const shown = (sel) => getComputedStyle($(sel)).display !== "none";
    await open({ admin: true, hide: "everyone", card: { cameras: ["camera.a"] } });
    const wall = { bare: panel.hasAttribute("bare"), bar: shown(".toolbar"), tabs: shown(".tabs"), top: getComputedStyle($(".tabs")).top, fab: !!$("[data-fab]") };
    $('.tab[data-tab="settings"]').click();
    await new Promise((r) => setTimeout(r, 20));
    return { wall, settings: { bare: panel.hasAttribute("bare"), bar: shown(".toolbar"), tabs: shown(".tabs"), tab: !$("#tab-settings").hidden } };
  });
  assert.deepEqual(r.wall, { bare: true, bar: false, tabs: true, top: "0px", fab: false });
  assert.deepEqual(r.settings, { bare: true, bar: false, tabs: true, tab: true });
});

test("Settings saves the top bar choice", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: true, card: { cameras: ["camera.a"] } }, "settings");
    const before = $('[data-hide="never"]').getAttribute("aria-checked");
    $('[data-hide="users"]').click();
    const dirty = { checked: $('[data-hide="users"]').getAttribute("aria-checked"), save: $("[data-save]").disabled };
    $("[data-save]").click();
    await new Promise((r) => setTimeout(r, 50));
    return { before, dirty, saved: sent.find((m) => m.type === "home_camera/update_settings").hide_toolbar };
  });
  assert.deepEqual(r, { before: "true", dirty: { checked: "true", save: false }, saved: "users" });
});

test("the top bar hidden: the menu button stays where Home Assistant shows it", async () => {
  const r = await page.evaluate(async () => {
    const shown = (sel) => getComputedStyle($(sel)).display !== "none";
    await open({ admin: false, hide: "users", card: { cameras: ["camera.a"] } });
    const wide = { menu: panel.hasAttribute("menu"), bar: shown(".toolbar") };
    panel.narrow = true;
    const bar = getComputedStyle($(".toolbar"));
    const user = { menu: panel.hasAttribute("menu"), bar: bar.display !== "none", position: bar.position, title: shown(".toolbar .grow"), button: shown(".toolbar ha-menu-button") };
    await open({ admin: true, hide: "everyone", card: { cameras: ["camera.a"] } });
    panel.narrow = true;
    const admin = { bar: shown(".toolbar"), tabMenu: shown(".tabs .tabmenu") };
    panel.narrow = false;
    return { wide, user, admin, adminWide: { tabMenu: shown(".tabs .tabmenu") } };
  });
  assert.deepEqual(r.wide, { menu: false, bar: false });
  // No tabs for a user: the menu button floats at the bottom left
  assert.deepEqual(r.user, { menu: true, bar: true, position: "fixed", title: false, button: true });
  // An administrator: the menu button at the start of the tabs
  assert.deepEqual(r.admin, { bar: false, tabMenu: true });
  assert.deepEqual(r.adminWide, { tabMenu: false });
});

test("the top bar hidden in the panel's registration: never shown while the settings load", async () => {
  const r = await page.evaluate(async () => {
    document.body.replaceChildren();
    const el = document.createElement("home-camera-panel");
    el.panel = { url_path: "cameras", config: { hide_toolbar: "everyone" } };
    el.route = { path: "" };
    document.body.appendChild(el);
    // Settings that never arrive: what the page shows while loading
    el.hass = { language: "en", user: { is_admin: true }, states: {}, connection: { subscribeMessage: () => new Promise(() => {}) } };
    window.panel = el;
    await new Promise((r) => setTimeout(r, 20));
    return { bare: el.hasAttribute("bare"), bar: getComputedStyle($(".toolbar")).display, tabs: getComputedStyle($(".tabs")).display };
  });
  assert.deepEqual(r, { bare: true, bar: "none", tabs: "flex" });
});

test("the top bar shows the state of the cameras, the wall comes right under the tabs", async () => {
  const r = await page.evaluate(async () => {
    await open({ admin: true, card: { cameras: ["camera.a", { camera: "camera.b", motion: ["binary_sensor.b_motion"] }, { camera: "camera.c", privacy: "switch.c_privacy" }] } });
    const hass = panel._hass;
    panel.hass = {
      ...hass,
      states: {
        ...hass.states,
        "camera.c": { entity_id: "camera.c", state: "idle", attributes: {} },
        "binary_sensor.b_motion": { entity_id: "binary_sensor.b_motion", state: "on", attributes: {} },
        "switch.c_privacy": { entity_id: "switch.c_privacy", state: "on", attributes: {} },
      },
    };
    await new Promise((res) => setTimeout(res, 50));
    const top = { pill: $(".toolbar .stpill")?.textContent.trim(), sub: $(".toolbar .bsub").textContent, tab: $("#tabbtn-cameras .cnt")?.textContent };
    const card = $("#tab-cameras hc-camera-wall");
    return { top, overview: [...panel.shadowRoot.querySelectorAll("#tab-cameras > :not(#wall)")].length, all: card._config.cameras.length, header: card._config.show_header };
  });
  assert.deepEqual(r.top, { pill: "Motion detected", sub: "2 cameras live · 1 hidden", tab: "1" });
  assert.equal(r.overview, 0, "no filter or tiles over the wall");
  assert.equal(r.all, 3);
  assert.equal(r.header, false, "the card's own header is left to the top bar");
});

test("Frigate cameras bring an Events tab, for every user, with the day's timeline and today's count", async () => {
  const r = await page.evaluate(async () => {
    const now = Date.now() / 1000;
    await open({ admin: false, card: { cameras: ["camera.a", "camera.f"] } }, "/events");
    const hass = makeHass({ admin: false, card: { cameras: ["camera.a", "camera.f"] } });
    hass.states["camera.f"] = { entity_id: "camera.f", state: "idle", attributes: { camera_name: "f", client_id: "frigate" } };
    hass.entities = { "camera.f": { entity_id: "camera.f", platform: "frigate" } };
    const callWS = hass.callWS;
    hass.callWS = async (msg) => {
      if (msg.type === "frigate/events/get")
        return [
          { id: "e1", camera: "f", label: "person", start_time: now - 30, end_time: now - 10, has_clip: true },
          { id: "e2", camera: "f", label: "dog", start_time: now - 4000, end_time: now - 3990, has_clip: true },
        ];
      if (msg.type === "auth/sign_path") return { path: `${msg.path}?authSig=x` };
      return callWS(msg);
    };
    document.body.replaceChildren();
    const el = document.createElement("home-camera-panel");
    el.panel = { url_path: "cameras", config: {} };
    el.route = { path: "/events" };
    document.body.appendChild(el);
    el.hass = hass;
    window.panel = el;
    await new Promise((res) => setTimeout(res, 150));
    const tl = $("#tab-events hc-frigate-timeline");
    const items = [...(tl?.shadowRoot.querySelectorAll(".it") || [])].map((i) => i.querySelector(".k span").textContent);
    return {
      tabs: tabs(),
      active: $(".tab.active")?.dataset.tab,
      items,
      selected: tl?.shadowRoot.querySelector(".it.sel")?.dataset.id,
      video: tl?.shadowRoot.querySelector(".screen video")?.getAttribute("src"),
      // The newest event is selected, its clip not downloaded until it is played
      preload: tl?.shadowRoot.querySelector(".screen video")?.preload,
      autoplay: tl?.shadowRoot.querySelector(".screen video")?.autoplay,
      count: $("#tabbtn-events .cnt")?.textContent,
      inactive: (panel._goTab("cameras"), tl.active),
    };
  });
  assert.deepEqual(r.tabs, ["cameras", "events"]);
  assert.equal(r.active, "events");
  assert.deepEqual(r.items, ["Person", "Dog"]);
  assert.equal(r.selected, "e1");
  assert.equal(r.video, "/api/frigate/frigate/notifications/e1/clip.mp4?authSig=x");
  assert.equal(r.preload, "none");
  assert.equal(r.autoplay, false);
  assert.equal(r.count, "2");
  assert.equal(r.inactive, false);
});
