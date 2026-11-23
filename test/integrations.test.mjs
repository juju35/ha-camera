import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCard } from "./load.mjs";

const { hcStreamRank, hcCamera, hcHidden } = loadCard("home-camera-card.js", ["hcStreamRank", "hcCamera", "hcHidden"]);
const plain = (v) => JSON.parse(JSON.stringify(v));

test("stream cameras ranked from their entity id, as the server's discovery does", () => {
  assert.equal(hcStreamRank("camera.garden_clear"), 3);
  assert.equal(hcStreamRank("camera.garden_balanced"), 2);
  assert.equal(hcStreamRank("camera.garden_fluent"), 1);
  assert.equal(hcStreamRank("camera.door_high_resolution_channel"), 3);
  assert.equal(hcStreamRank("camera.attic_profile_000"), 3);
  assert.equal(hcStreamRank("camera.attic_profile_1"), 2);
  assert.equal(hcStreamRank("camera.salon"), null);
});

const reolink = () => {
  const ent = (id) => ({ entity_id: id, device_id: "r", platform: "reolink" });
  const ids = [
    "camera.garden_clear",
    "camera.garden_fluent",
    "camera.garden_snapshots_fluent",
    "switch.garden_privacy_mode",
    "button.garden_ptz_left",
    "button.garden_ptz_right",
    "button.garden_ptz_stop",
    "select.garden_ptz_preset",
  ];
  return {
    entities: Object.fromEntries(ids.map((id) => [id, ent(id)])),
    states: Object.fromEntries(ids.map((id) => [id, { state: "idle", attributes: { supported_features: 2 } }])),
  };
};

test("Reolink: Clear plays HD and Fluent SD, PTZ buttons with their stop, the preset select and the privacy switch", () => {
  const cam = hcCamera(reolink(), "camera.garden_clear", 0);
  assert.equal(cam.sd, "camera.garden_fluent");
  assert.equal(cam.privacy, "switch.garden_privacy_mode");
  assert.deepEqual(plain(cam.ptz), { left: "button.garden_ptz_left", right: "button.garden_ptz_right", stop: "button.garden_ptz_stop" });
  assert.equal(cam.preset, "select.garden_ptz_preset");
  // The lighter stream itself has no SD
  assert.equal(hcCamera(reolink(), "camera.garden_fluent", 0).sd, null);
});

test("a camera that can be turned off is its own privacy control, hidden while off; ONVIF moves with onvif.ptz", () => {
  const hass = {
    entities: { "camera.porch": { entity_id: "camera.porch", platform: "aarlo" } },
    states: { "camera.porch": { state: "off", attributes: { supported_features: 3 } } },
  };
  const cam = hcCamera(hass, "camera.porch", 0);
  assert.equal(cam.privacy, "camera.porch");
  assert.equal(hcHidden(hass, cam), true);
  hass.states["camera.porch"].state = "idle";
  assert.equal(hcHidden(hass, cam), false);
  const onvif = hcCamera(hass, { camera: "camera.porch", ptz: "onvif", privacy: false }, 0);
  assert.equal(onvif.ptz.service, "onvif");
  assert.equal(onvif.ptz.up, "camera.porch");
  assert.equal(onvif.privacy, null);
});

test("an NVR's channels whose names hold stream words are not taken for streams of one camera", () => {
  const ids = ["camera.nvr_main_gate", "camera.nvr_back_low_wall"];
  const hass = {
    entities: Object.fromEntries(ids.map((id) => [id, { entity_id: id, device_id: "nvr" }])),
    states: Object.fromEntries(ids.map((id) => [id, { state: "idle", attributes: { supported_features: 2 } }])),
  };
  assert.equal(hcCamera(hass, "camera.nvr_main_gate", 0).sd, null);
});
