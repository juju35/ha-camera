// ── Frigate ──────────────────────────────────────────────────────────────────
// `frigate:` options of the card. player: auto (Home Assistant's player, which the Frigate integration already
// connects to Frigate's go2rtc; Frigate's own sub-stream, sd_stream, for SD), frigate (always Frigate's go2rtc,
// through the integration's proxy) or home_assistant (never). instance: the Frigate client id, when there are
// several; else the camera's own. url: Frigate's address for the "Open in Frigate" button, else the sidebar panel
// of a Frigate app (Frigate, Frigate Proxy…) when there is one. duplicates: the panel's discovery only.
import { HC_CAMERA_ON_OFF, hcDeviceSd, hcMotion, hcPtz, hcSibling } from "./entity-discovery.js";

export const HC_FRIGATE_DEFAULTS = {
  player: 'auto',
  sd_stream: '{camera}_sub',
  instance: '',
  url: '',
  open_in_frigate: true,
  duplicates: 'frigate',
  // The events of the Frigate cameras, under the grid: folded unless events_expanded; events_labels (YAML) keeps
  // some objects only. badges: Frigate's detection and recording switches on the tiles.
  events: true,
  events_expanded: false,
  events_limit: 5,
  badges: true,
};
export const HC_PLAYERS = ['auto', 'frigate', 'home_assistant'];
export const HC_DUPLICATES = ['frigate', 'native', 'both'];
export function hcFrigateConf(config) {
  return Object.assign({}, HC_FRIGATE_DEFAULTS, config?.frigate || {});
}

export function hcIsFrigate(hass, id) {
  const platform = hass?.entities?.[id]?.platform;
  if (platform) return platform === 'frigate';
  const attrs = hass?.states?.[id]?.attributes;
  return !!(attrs?.camera_name && attrs?.client_id);
}

// A name compared without case, accents nor punctuation: "Séjour cam" and "sejour_cam" match.
export const hcKey = (name) =>
  String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

// The native camera (Tapo…) of a Frigate camera, whose privacy switch and PTZ buttons it takes: the only camera
// of its area that does not come from Frigate, else the one of its area (or anywhere, without an area) with its name.
// Indexed once per `hass.entities` object, as the device index.
export const hcNativeIndex = new WeakMap();
export function hcNative(hass, id) {
  const reg = hass?.entities;
  if (!reg) return null;
  let index = hcNativeIndex.get(reg);
  if (!index) {
    index = new Map();
    hcNativeIndex.set(reg, index);
  }
  if (index.has(id)) return index.get(id);
  const area = (e) => e?.area_id || hass.devices?.[e?.device_id]?.area_id || null;
  const name = (e) => {
    const dev = hass.devices?.[e?.device_id];
    return e?.name || dev?.name_by_user || dev?.name || hass.states?.[e?.entity_id]?.attributes?.friendly_name || e?.entity_id;
  };
  const own = reg[id];
  const natives = Object.values(reg).filter(
    (e) =>
      e.entity_id.startsWith('camera.') &&
      e.platform !== 'frigate' &&
      !e.hidden &&
      !/_sd_stream$/.test(e.entity_id) &&
      hass.states?.[e.entity_id],
  );
  const where = area(own);
  const sameArea = where ? natives.filter((e) => area(e) === where) : [];
  let found = sameArea.length === 1 ? sameArea[0] : null;
  if (!found) {
    const key = hcKey(hass.states?.[id]?.attributes?.camera_name || name(own));
    const named = (sameArea.length ? sameArea : natives).filter((e) => hcKey(name(e)) === key);
    found = named.length === 1 ? named[0] : null;
  }
  const native = found ? found.entity_id : null;
  index.set(id, native);
  return native;
}

// A camera entry, completed from its device: SD stream, privacy switch and PTZ buttons. A Frigate camera takes them
// from its native camera (controls_from, found by hcNative unless set), and its SD stream from Frigate.
export function hcCamera(hass, raw, index, fc = HC_FRIGATE_DEFAULTS) {
  const cam = typeof raw === 'string' ? { camera: raw } : Object.assign({}, raw);
  const id = cam.camera || cam.entity || '';
  const st = hass?.states?.[id];
  const frigate = !!id && hcIsFrigate(hass, id);
  // Where the controls are: the camera itself, or (Frigate) its native camera
  const ctl = (cam.controls_from === false ? null : cam.controls_from || (frigate ? hcNative(hass, id) : null)) || id;
  let sd = cam.sd;
  if (sd === undefined && /_hd_stream$/.test(id)) {
    const guess = id.replace(/_hd_stream$/, '_sd_stream');
    if (hass?.states?.[guess]) sd = guess;
  }
  // A stream of a device that has lighter ones (Reolink Clear → Fluent, UniFi High → Low, ONVIF mainstream → substream)
  if (sd === undefined) sd = hcDeviceSd(hass, id) || undefined;
  // Tapo Cameras (ha-tapo) names it switch.*_privacy_mode
  // Without a privacy switch, a camera that can be turned off (Arlo, Netatmo) is its own privacy control
  // (not a Frigate camera: turning it off only pauses Frigate's detection)
  const privacy =
    cam.privacy === false
      ? null
      : cam.privacy ||
        hcSibling(hass, ctl, 'switch', '_privacy') ||
        hcSibling(hass, ctl, 'switch', '_privacy_mode') ||
        (!frigate && st && (Number(st.attributes?.supported_features) & HC_CAMERA_ON_OFF) ? id : null);
  // Tapo Cameras (ha-tapo): one camera entity whose stream is chosen by its select.*_stream_quality (hd / sd),
  // instead of an SD camera entity next to the HD one. Not for a Frigate camera: Frigate reads the camera itself.
  const quality = sd || frigate ? null : hcSibling(hass, id, 'select', '_stream_quality') || null;
  const name = cam.name || st?.attributes.friendly_name || id;
  const player = HC_PLAYERS.includes(cam.player) ? cam.player : HC_PLAYERS.includes(fc.player) ? fc.player : 'auto';
  const fname = st?.attributes?.camera_name || id.replace(/^camera\./, '');
  const motion = hcMotion(hass, cam, id);
  return {
    key: cam.id || id.replace(/^camera\./, '') || `camera_${index}`,
    camera: id,
    sd: sd || null,
    name: name,
    short: cam.short_name || name,
    privacy: privacy,
    quality: quality,
    power: cam.power || null,
    ptz: hcPtz(hass, cam, ctl, frigate ? id : null),
    // A preset select of the camera's device (Reolink: select.*_ptz_preset), shown with the pan & tilt arrows
    preset: cam.preset === false ? null : cam.preset || hcSibling(hass, ctl, 'select', '_ptz_preset') || null,
    motion: motion.length || ctl === id ? motion : hcMotion(hass, {}, ctl),
    player: player,
    // Frigate: its camera name and instance (the integration's proxy), and its SD stream when there is no SD entity
    // The thumbnail and clip proxies need the instance in their path: Frigate's default client id when unknown
    frigate: frigate ? { name: fname, instance: fc.instance || st?.attributes?.client_id || 'frigate' } : null,
    // Frigate's detection and recording switches of the camera (frigate.badges)
    switches:
      frigate && fc.badges !== false
        ? [
            ['fdetect', hcSibling(hass, id, 'switch', '_detect')],
            ['frec', hcSibling(hass, id, 'switch', '_recordings')],
          ].filter(([, e]) => e)
        : [],
    sdStream: frigate && !sd && player !== 'home_assistant' && fc.sd_stream ? String(fc.sd_stream).replace('{camera}', fname) : null,
  };
}
