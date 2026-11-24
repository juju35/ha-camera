// ── Entity discovery ─────────────────────────────────────────────────────────
// The registry is indexed by device once per `hass.entities` object (it only changes with the registry).
import { HC_PTZ_DIRS } from "./i18n-helpers.js";

export const hcDeviceIndex = new WeakMap();
export function hcDeviceEntities(reg, device) {
  let index = hcDeviceIndex.get(reg);
  if (!index) {
    index = new Map();
    for (const e of Object.values(reg)) {
      if (!e.device_id) continue;
      if (!index.has(e.device_id)) index.set(e.device_id, []);
      index.get(e.device_id).push(e.entity_id);
    }
    hcDeviceIndex.set(reg, index);
  }
  return index.get(device) || [];
}

// An entity of the camera's device whose id ends with `suffix` (Tapo: switch.*_privacy, button.*_move_left), or
// whose translation key is that suffix: integrations that name their entities in the user's language (Tapo Cameras:
// button.salon_gauche is the move_left button) only keep the English key in the registry.
export function hcSibling(hass, cameraId, domain, suffix) {
  const reg = hass?.entities;
  const device = reg?.[cameraId]?.device_id;
  if (!device) return undefined;
  const key = suffix.replace(/^_/, '');
  const ids = hcDeviceEntities(reg, device).filter((id) => id.startsWith(`${domain}.`));
  return ids.find((id) => id.endsWith(suffix)) || ids.find((id) => reg[id]?.translation_key === key);
}

// True when an event path goes through one of the card's own controls (privacy toggle, HD/SD switch,
// tile buttons, including the one covering the image that opens the camera).
export function hcOwnControl(path) {
  return path.some((n) => n.dataset?.toggle || n.dataset?.quality || n.dataset?.action || n.dataset?.ev);
}

// "16:9", "4/3" or 1.5 as a width / height ratio; 16:9 when missing or invalid.
export function hcRatio(value) {
  if (typeof value === 'number' && value > 0) return value;
  const m = /^\s*(\d+(?:\.\d+)?)\s*[:/x]\s*(\d+(?:\.\d+)?)\s*$/.exec(String(value || ''));
  const r = m ? Number(m[1]) / Number(m[2]) : Number(value);
  return Number.isFinite(r) && r > 0 ? r : 16 / 9;
}

// Home Assistant's own live player (WebRTC through go2rtc, HLS or MJPEG, whichever the camera offers).
// It ships with the picture cards, which are loaded on demand: building one loads it.
export let hcStreamLoad = null;
export function hcLoadStream(entity) {
  if (customElements.get('ha-camera-stream')) return Promise.resolve();
  if (!hcStreamLoad) {
    hcStreamLoad = (async () => {
      const helpers = window.loadCardHelpers ? await window.loadCardHelpers() : null;
      if (!helpers) throw new Error('loadCardHelpers unavailable');
      helpers.createCardElement({ type: 'picture-entity', entity: entity, camera_view: 'live' });
      // whenDefined never rejects: time out so a failed load rearms hcStreamLoad instead of hanging forever.
      let timer;
      try {
        await Promise.race([
          customElements.whenDefined('ha-camera-stream'),
          new Promise((_, reject) => {
            timer = setTimeout(() => reject(new Error('ha-camera-stream not loaded')), 15000);
          }),
        ]);
      } finally {
        clearTimeout(timer);
      }
    })().catch((err) => {
      hcStreamLoad = null; // the next hass update tries again
      throw err;
    });
  }
  return hcStreamLoad;
}

// PTZ buttons as { left, right, up, down }: a prefix ("button.x_move" + "_left"…), an object, or found on the device
// (`auto`, or `buttons`). `frigate`: Frigate's frigate.ptz action on the Frigate camera `frigateId`, as
// { service: 'frigate', left: frigateId, … } (the camera moves from the press until the release).
export function hcPtz(hass, cam, cameraId, frigateId) {
  const ptz = cam.ptz;
  if (ptz === false || ptz === 'none') return null;
  if (ptz === 'frigate') {
    if (!frigateId) return null;
    const out = { service: 'frigate' };
    for (const d of HC_PTZ_DIRS) out[d] = frigateId;
    return out;
  }
  // ONVIF: its onvif.ptz action on the camera itself, moving from the press until the release
  if (ptz === 'onvif') {
    const out = { service: 'onvif' };
    for (const d of HC_PTZ_DIRS) out[d] = cameraId;
    return out;
  }
  if (!ptz || ptz === 'auto' || ptz === 'buttons') {
    // Each direction on its own: translated entity ids share no prefix (Tapo Cameras: *_gauche, *_monter…).
    // move_* (Tapo), else ptz_* (Reolink, EZVIZ); a ptz_stop button makes the moves continuous until it is pressed.
    for (const prefix of ['move', 'ptz']) {
      const found = {};
      for (const d of HC_PTZ_DIRS) {
        const id = hcSibling(hass, cameraId, 'button', `_${prefix}_${d}`);
        if (id) found[d] = id;
      }
      if (!(found.left || found.right || found.up || found.down)) continue;
      const stop = hcSibling(hass, cameraId, 'button', `_${prefix}_stop`);
      if (stop) found.stop = stop;
      return found;
    }
    return null;
  }
  if (typeof ptz === 'string') {
    const out = {};
    for (const d of HC_PTZ_DIRS) out[d] = `${ptz}_${d}`;
    return out;
  }
  return ptz;
}

// Motion sensors of the camera's device: binary sensors whose device class or id says motion, occupancy or person
// (Tapo: binary_sensor.*_motion, *_person_detection). An entity id or a list in the config replaces the lookup.
export const HC_MOTION_CLASSES = ['motion', 'occupancy', 'presence'];
export const HC_MOTION_KEYS = ['motion', 'person'];
export function hcMotion(hass, cam, cameraId) {
  if (cam.motion === false) return [];
  if (cam.motion) return [].concat(cam.motion);
  const reg = hass?.entities;
  const device = reg?.[cameraId]?.device_id;
  if (!device) return [];
  const sensors = hcDeviceEntities(reg, device).filter((id) => id.startsWith('binary_sensor.'));
  // Integrations that give translation keys (Tapo Cameras, whose ids are in the user's language): motion and person
  // only, not its vehicle, pet or line-crossing detections that share the motion device class
  const keyed = sensors.filter((id) => HC_MOTION_KEYS.includes(reg[id]?.translation_key));
  if (keyed.length) return keyed;
  return sensors.filter(
    (id) => HC_MOTION_CLASSES.includes(hass.states?.[id]?.attributes?.device_class) || /(motion|occupancy|person)/.test(id),
  );
}

// Streams of one device (Reolink: Fluent, Balanced, Clear; UniFi Protect: High, Medium, Low; ONVIF: profiles):
// how detailed a stream camera is, from the words of its entity id (3: main, 2: medium, 1: sub), null when it does
// not say. ONVIF profiles: the lower the number, the more detailed. Same rule as the server's discovery.
export const HC_STREAM_RANKS = { clear: 3, high: 3, main: 3, mainstream: 3, hd: 3, balanced: 2, medium: 2, fluent: 1, low: 1, sub: 1, substream: 1, sd: 1 };
export function hcStreamRank(id) {
  const words = String(id).split('.').pop().split('_');
  const ranks = words.map((w) => HC_STREAM_RANKS[w]).filter(Boolean);
  if (ranks.length) return Math.max(...ranks);
  for (let i = 0; i < words.length; i++) {
    if (!words[i].startsWith('profile')) continue;
    const n = words[i].slice(7) || words[i + 1] || '';
    if (/^\d+$/.test(n)) return Math.max(1, 3 - Number(n));
  }
  return null;
}
// A stream camera's entity id without its stream words: the streams of one camera share it (garden_clear,
// garden_fluent), an NVR's channels do not (main_gate, back_low_wall)
export const hcStreamBase = (id) =>
  String(id)
    .split('.')
    .pop()
    .split('_')
    .filter((w) => !HC_STREAM_RANKS[w] && !w.startsWith('profile') && !/^\d+$/.test(w))
    .join('_');
// The lightest stream of a camera's device, when the camera is its most detailed one (snapshot cameras aside)
export function hcDeviceSd(hass, id) {
  const reg = hass?.entities;
  const device = reg?.[id]?.device_id;
  const rank = hcStreamRank(id);
  if (!device || rank === null) return null;
  const base = hcStreamBase(id);
  const others = hcDeviceEntities(reg, device).filter(
    (e) => e !== id && e.startsWith('camera.') && !e.includes('snapshot') && hass.states?.[e] && hcStreamBase(e) === base,
  );
  let best = null;
  for (const e of others) {
    const r = hcStreamRank(e);
    if (r === null || r >= rank) {
      if (r !== null && r > rank) return null; // not the most detailed stream
      continue;
    }
    if (!best || r < best.r) best = { e, r };
  }
  return best ? best.e : null;
}

// A camera is hidden when its privacy switch is on (or, a camera as its own privacy control, while it is off), or
// its power switch is off.
export function hcHidden(hass, cam) {
  const st = (id) => (id ? hass?.states?.[id]?.state : undefined);
  const privacy = cam.privacy && (cam.privacy.startsWith('camera.') ? st(cam.privacy) === 'off' : st(cam.privacy) === 'on');
  return !!(privacy || (cam.power && st(cam.power) === 'off'));
}
export const HC_CAMERA_ON_OFF = 1; // CameraEntityFeature.ON_OFF
