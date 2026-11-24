import { HomeCameraPanelI18n } from "./i18n/homecamerapaneli18n.js";

export var HCP_TABS = ['cameras', 'events', 'settings'];
export var HCP_CARD = 'home-camera-card';
// The video wall the panel draws its cameras with: an element of the card file, not a dashboard card.
export var HCP_WALL = 'hc-camera-wall';
export var HCP_HIDE = ['never', 'everyone', 'users'];

// Text into HTML: the five special characters as numeric references
export function hcpEsc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function hcpT(lang, key, vars) {
  var text = (HomeCameraPanelI18n[lang] || HomeCameraPanelI18n.en)[key] || HomeCameraPanelI18n.en[key] || key;
  for (var name of Object.keys(vars || {})) text = text.replace(`{${name}}`, vars[name]);
  return text;
}

// The first camera card (the full one, not the mini) of a dashboard configuration: views, sections, stacks.
export function hcpFindCard(node) {
  if (!node || typeof node !== 'object') return null;
  if (Array.isArray(node)) {
    for (var item of node) {
      var found = hcpFindCard(item);
      if (found) return found;
    }
    return null;
  }
  if (node.type === `custom:${HCP_CARD}` && Array.isArray(node.cameras)) return node;
  for (var key of ['views', 'sections', 'cards', 'card']) {
    var inner = hcpFindCard(node[key]);
    if (inner) return inner;
  }
  return null;
}

// A found camera as a camera entry of the card, with the controls found on its device (privacy switch, pan and tilt
// buttons, motion sensors), so they show in the editor; the same entry as the server's discovery.card_entry
export function hcpFoundEntry(cam) {
  var entry = { camera: cam.camera, name: cam.name };
  if (cam.controls_from) entry.controls_from = cam.controls_from;
  if (cam.privacy) entry.privacy = cam.privacy;
  if (cam.ptz) entry.ptz = cam.ptz;
  if (cam.motion?.length) entry.motion = cam.motion.length === 1 ? cam.motion[0] : cam.motion;
  return entry;
}

// The card configuration the panel stores: no type, no layout options of the dashboard it came from.
export function hcpCardConfig(card) {
  var out = Object.assign({}, card);
  // `layout` too: the panel always shows the wall, whatever the stored configuration says
  for (var key of ['type', 'layout', 'grid_options', 'view_layout', 'layout_options', 'visibility']) delete out[key];
  return out;
}
