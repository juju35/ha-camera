import { HcI18n } from "./i18n/hci18n.js";

// Full tag when the dictionary has it (sr-Latn), else the part before the dash (fr-FR -> fr, pt-BR -> pt), else English.
export function hcLang(raw) {
  const l = String(raw || 'en');
  if (HcI18n[l]) return l;
  const base = l.split('-')[0];
  return HcI18n[base] ? base : 'en';
}

export function hcT(lang, key) {
  const strings = HcI18n[lang] || HcI18n.en;
  return strings[key] || HcI18n.en[key] || key;
}

// The width of an element's whole text in fractional pixels, even while an ellipsis cuts it.
export const hcTextWidth = (el) => {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width || el.scrollWidth;
};

// In-place update of a part of the shadow DOM: the nodes that stay keep their place, so a new state (motion, a
// privacy switch) never rebuilds the header's picture, its icons or its pill — the card keeps its height and the
// running animations go on. Nodes are matched by position and tag; attributes and text are patched.
export const hcPatchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
export const hcPatchChildren = (cur, next) => {
  const fresh = [...next.childNodes];
  fresh.forEach((n, i) => {
    const o = cur.childNodes[i];
    if (!o || o.nodeType !== n.nodeType || o.nodeName !== n.nodeName) {
      if (o) cur.replaceChild(n, o);
      else cur.appendChild(n);
      return;
    }
    if (n.nodeType === 1) {
      hcPatchAttrs(o, n);
      hcPatchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
export const hcMorph = (root, html) => {
  if (typeof document === 'undefined' || !document.createElement('template').content || !root.childNodes) {
    root.innerHTML = html;
    return;
  }
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  hcPatchChildren(root, tpl.content);
};

export function hcEsc(s) {
  return String(s == null ? '' : s).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

export const HC_DEFAULTS = {
  show_title: true,
  hd_option: 'HD',
  sd_option: 'SD',
  columns: 2,
  show_summary: true,
  show_badges: true,
  show_motion: true,
  illustration: true,
  illustration_theme: 'auto',
};

export const HC_PTZ_DIRS = ['left', 'right', 'up', 'down'];
// PTZ arrow held down: first repeat after HC_PTZ_HOLD_MS, then one press every HC_PTZ_REPEAT_MS.
export const HC_PTZ_HOLD_MS = 500;
export const HC_PTZ_REPEAT_MS = 350;
// How long a privacy badge waits for its switch to answer before giving up.
export const HC_PENDING_MS = 15000;
// Mini card: how often the camera snapshots of its compact view are refreshed.
export const HC_SNAPSHOT_MS = 10000;
export const HC_PTZ_ICONS = { left: 'mdi:chevron-left', right: 'mdi:chevron-right', up: 'mdi:chevron-up', down: 'mdi:chevron-down' };
