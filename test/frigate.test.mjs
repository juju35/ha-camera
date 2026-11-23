import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCard } from "./load.mjs";

const { hcCamera, hcFrigateConf, hcNative, HomeCameraCard, HomeCameraCardEditor } = loadCard("home-camera-card.js", [
  "hcCamera",
  "hcFrigateConf",
  "hcNative",
  "HomeCameraCard",
  "HomeCameraCardEditor",
], {
  // The editor's config-changed carries its config in `detail`
  CustomEvent: class {
    constructor(type, init) {
      this.type = type;
      this.detail = init?.detail;
    }
  },
});

// A Tapo camera (its privacy switch, PTZ buttons and motion sensor on its device) and its Frigate camera, both in the
// living room; a second Frigate camera alone in the garden.
const home = () => ({
  entities: {
    "camera.sejour": { entity_id: "camera.sejour", device_id: "tapo", platform: "tapo_cameras" },
    "switch.sejour_privacy_mode": { entity_id: "switch.sejour_privacy_mode", device_id: "tapo", platform: "tapo_cameras" },
    "button.sejour_move_left": { entity_id: "button.sejour_move_left", device_id: "tapo", platform: "tapo_cameras" },
    "binary_sensor.sejour_motion": { entity_id: "binary_sensor.sejour_motion", device_id: "tapo", platform: "tapo_cameras" },
    "camera.salon": { entity_id: "camera.salon", device_id: "fr1", platform: "frigate" },
    "binary_sensor.salon_motion": { entity_id: "binary_sensor.salon_motion", device_id: "fr1", platform: "frigate" },
    "camera.jardin": { entity_id: "camera.jardin", device_id: "fr2", platform: "frigate" },
  },
  devices: {
    tapo: { name: "Séjour", area_id: "living" },
    fr1: { name: "Salon", area_id: "living" },
    fr2: { name: "Jardin", area_id: "garden" },
  },
  states: {
    "camera.sejour": { state: "idle", attributes: { friendly_name: "Séjour" } },
    "camera.salon": { state: "streaming", attributes: { friendly_name: "Salon", camera_name: "salon", client_id: "frigate" } },
    "camera.jardin": { state: "streaming", attributes: { friendly_name: "Jardin", camera_name: "jardin", client_id: "frigate" } },
    "binary_sensor.salon_motion": { state: "off", attributes: { device_class: "motion" } },
    "binary_sensor.sejour_motion": { state: "off", attributes: { device_class: "motion" } },
  },
});

test("a Frigate camera takes the privacy switch and PTZ buttons of the native camera of its area", () => {
  const hass = home();
  assert.equal(hcNative(hass, "camera.salon"), "camera.sejour");
  assert.equal(hcNative(hass, "camera.jardin"), null);
  const cam = hcCamera(hass, "camera.salon", 0);
  assert.equal(cam.privacy, "switch.sejour_privacy_mode");
  assert.equal(cam.ptz.left, "button.sejour_move_left");
  // Its motion sensor is Frigate's own; the native camera's only when Frigate has none
  assert.deepEqual([...cam.motion], ["binary_sensor.salon_motion"]);
  assert.equal(cam.frigate.name, "salon");
  assert.equal(cam.frigate.instance, "frigate");
  assert.equal(cam.sdStream, "salon_sub");
  assert.equal(cam.player, "auto");
});

test("controls_from, ptz and player are set per camera, the frigate options for the card", () => {
  const hass = home();
  const fc = hcFrigateConf({ frigate: { player: "frigate", sd_stream: "{camera}_low", instance: "nas" } });
  const cam = hcCamera(hass, { camera: "camera.jardin", controls_from: "camera.sejour", ptz: "frigate" }, 0, fc);
  assert.equal(cam.privacy, "switch.sejour_privacy_mode");
  assert.equal(cam.ptz.service, "frigate");
  assert.equal(cam.ptz.left, "camera.jardin");
  assert.equal(cam.player, "frigate");
  assert.equal(cam.sdStream, "jardin_low");
  assert.equal(cam.frigate.instance, "nas");
  assert.equal(hcCamera(hass, { camera: "camera.salon", ptz: false }, 0).ptz, null);
  assert.equal(hcCamera(hass, { camera: "camera.salon", controls_from: false }, 0).privacy, null);
  const ha = hcCamera(hass, { camera: "camera.salon", player: "home_assistant" }, 0);
  assert.equal(ha.sdStream, null);
  // Not Frigate: no Frigate source, ptz: frigate gives no arrows
  const tapo = hcCamera(hass, { camera: "camera.sejour", ptz: "frigate" }, 0);
  assert.equal(tapo.frigate, null);
  assert.equal(tapo.ptz, null);
});

test("the player source: Frigate's sub-stream in SD (auto), every stream with player: frigate, none otherwise", () => {
  const hass = home();
  const card = new HomeCameraCard();
  card._config = {};
  const auto = hcCamera(hass, "camera.salon", 0);
  assert.equal(card._frigateSource(auto, true), null);
  const sd = card._frigateSource(auto, false);
  assert.equal(sd.stream, "salon_sub");
  assert.equal(sd.path, "/api/frigate/frigate/webrtc/api/ws");
  const always = hcCamera(hass, { camera: "camera.salon", player: "frigate" }, 0);
  assert.equal(card._frigateSource(always, true).stream, "salon");
  assert.equal(card._frigateSource(hcCamera(hass, "camera.sejour", 0), false), null);
});

test("Open in Frigate: the frigate.url option, else a Frigate app's panel, else no button", () => {
  const hass = home();
  const card = new HomeCameraCard();
  card._hass = hass;
  card._config = {};
  const cam = hcCamera(hass, "camera.salon", 0);
  assert.equal(card._frigateUrl(cam), null);
  hass.panels = { lovelace: {}, ccab4aaf_frigate: {}, "ccab4aaf_frigate-proxy": {} };
  assert.equal(card._frigateUrl(cam), "/ccab4aaf_frigate-proxy");
  card._config = { frigate: { url: "https://frigate.example.com" } };
  assert.equal(card._frigateUrl(cam), "https://frigate.example.com");
  card._config = { frigate: { open_in_frigate: false } };
  assert.equal(card._frigateUrl(cam), null);
  assert.equal(card._frigateUrl(hcCamera(hass, "camera.sejour", 0)), null);
});

test("the editor keeps only the frigate options that differ from their defaults", () => {
  const editor = new HomeCameraCardEditor();
  editor._config = {};
  let sent;
  editor.dispatchEvent = (ev) => {
    sent = ev.detail.config;
  };
  editor._render = () => {};
  editor._valueChanged({ stopPropagation() {}, detail: { value: { frigate: { ...hcFrigateConf({}), player: "frigate" } } } });
  assert.deepEqual(JSON.parse(JSON.stringify(sent.frigate)), { player: "frigate" });
  editor._valueChanged({ stopPropagation() {}, detail: { value: { frigate: hcFrigateConf({}) } } });
  assert.equal(sent.frigate, undefined);
});
